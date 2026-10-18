import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { checkCourseAdmin, courseDb } from '@/lib/courses';
import { MAX_COURSE_FILE_BYTES, isValidCourseBlobPathname } from '@/lib/course-files';

// The admin page uploads files straight from the browser to Vercel Blob
// (so large files never pass through our server). Before each upload, the
// browser asks this route for a short-lived upload token, and this is where
// we check the person is an admin and the file is going to the right place.
//
// Saving the file into a course happens afterwards, in the addMaterial
// server action (app/courses/admin/actions.ts), which re-checks everything.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const check = await checkCourseAdmin();
        if (check.status !== 'ok') {
          throw new Error('Only administrators can upload course files.');
        }

        let courseId = '';
        try {
          courseId = String((JSON.parse(clientPayload ?? '{}') as { courseId?: unknown }).courseId ?? '');
        } catch {
          throw new Error('Invalid upload request.');
        }
        if (!isValidCourseBlobPathname(pathname, courseId)) {
          throw new Error('Invalid file location.');
        }
        const course = await courseDb.course.findUnique({ where: { id: courseId }, select: { id: true } });
        if (!course) {
          throw new Error('That course no longer exists.');
        }

        return {
          maximumSizeInBytes: MAX_COURSE_FILE_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
