// =============================================================================
// A small ZIP writer for "download my work". Files are stored as they are
// (no compression: notebooks, PDFs and images barely shrink anyway), one at a
// time, so a large export never sits in memory all at once. Each file is read
// whole before it is written, so its size and checksum go in its header: the
// plainest form of ZIP, opened by Windows, macOS and every unzip tool.
// No package needed. Limits: under 4 GB in total, under 65,535 files.
// =============================================================================

export interface ZipEntry {
  /** Path inside the archive, with "/" between folders. */
  name: string;
  /** Contents, or a function that loads them (null = skip this entry). */
  data: Uint8Array | string | (() => Promise<Uint8Array | null>);
  date?: Date;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** MS-DOS date and time, as ZIP stores them (local time, 2-second steps, from 1980). */
function dosDateTime(d: Date): { time: number; date: number } {
  const year = Math.min(Math.max(d.getFullYear(), 1980), 2107);
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

const encoder = new TextEncoder();

/**
 * Turns a list of entries into the bytes of a ZIP file, produced as the
 * entries are read. Entries whose loader returns null are left out.
 */
export function zipStream(entries: Iterable<ZipEntry> | AsyncIterable<ZipEntry>): ReadableStream<Uint8Array> {
  const central: Uint8Array[] = [];
  let offset = 0;
  let count = 0;
  const iterator = (Symbol.asyncIterator in entries
    ? (entries as AsyncIterable<ZipEntry>)[Symbol.asyncIterator]()
    : (entries as Iterable<ZipEntry>)[Symbol.iterator]()) as AsyncIterator<ZipEntry> | Iterator<ZipEntry>;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        const next = await iterator.next();
        if (next.done) {
          // Central directory, then the end record.
          const size = central.reduce((n, c) => n + c.length, 0);
          for (const c of central) controller.enqueue(c);
          const end = new DataView(new ArrayBuffer(22));
          end.setUint32(0, 0x06054b50, true);
          end.setUint16(8, count, true);
          end.setUint16(10, count, true);
          end.setUint32(12, size, true);
          end.setUint32(16, offset, true);
          controller.enqueue(new Uint8Array(end.buffer));
          controller.close();
          return;
        }
        const entry = next.value;
        const raw = typeof entry.data === 'function' ? await entry.data() : entry.data;
        if (raw === null) continue; // nothing to add; read the next entry
        const data = typeof raw === 'string' ? encoder.encode(raw) : raw;
        const name = encoder.encode(entry.name);
        const crc = crc32(data);
        const { time, date } = dosDateTime(entry.date ?? new Date());

        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034b50, true);
        local.setUint16(4, 20, true); // version needed
        local.setUint16(6, 0x0800, true); // names are UTF-8
        local.setUint16(8, 0, true); // stored
        local.setUint16(10, time, true);
        local.setUint16(12, date, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, data.length, true);
        local.setUint32(22, data.length, true);
        local.setUint16(26, name.length, true);

        const dir = new DataView(new ArrayBuffer(46));
        dir.setUint32(0, 0x02014b50, true);
        dir.setUint16(4, 20, true); // made by
        dir.setUint16(6, 20, true); // needed
        dir.setUint16(8, 0x0800, true);
        dir.setUint16(10, 0, true);
        dir.setUint16(12, time, true);
        dir.setUint16(14, date, true);
        dir.setUint32(16, crc, true);
        dir.setUint32(20, data.length, true);
        dir.setUint32(24, data.length, true);
        dir.setUint16(28, name.length, true);
        dir.setUint32(42, offset, true);
        const record = new Uint8Array(46 + name.length);
        record.set(new Uint8Array(dir.buffer), 0);
        record.set(name, 46);
        central.push(record);

        controller.enqueue(new Uint8Array(local.buffer));
        controller.enqueue(name);
        controller.enqueue(data);
        offset += 30 + name.length + data.length;
        count++;
        return; // one file per pull, so large exports stream out
      }
    },
  });
}

/**
 * A safe, readable name for a file or folder inside the archive: no slashes,
 * no characters Windows refuses, never empty, not too long.
 */
export function zipSafeName(name: string, fallback = 'file'): string {
  const cleaned = name
    .normalize('NFC')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 120);
  return cleaned || fallback;
}

/** Keeps names unique inside one folder: "report.pdf", "report (2).pdf", … */
export function uniqueNamer(): (name: string) => string {
  const used = new Set<string>();
  return (name: string) => {
    if (!used.has(name.toLowerCase())) {
      used.add(name.toLowerCase());
      return name;
    }
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    for (let i = 2; ; i++) {
      const candidate = `${base} (${i})${ext}`;
      if (!used.has(candidate.toLowerCase())) {
        used.add(candidate.toLowerCase());
        return candidate;
      }
    }
  };
}
