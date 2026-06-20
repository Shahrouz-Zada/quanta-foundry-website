import SectionHeading from '@/components/ui/SectionHeading';
import Badge from '@/components/ui/Badge';
import { founder } from '@/data/team';
import { Award } from 'lucide-react';

export default function FounderSection() {
  return (
    <section id="leadership" className="py-24 bg-gradient-to-b from-[#0A1929] to-[#0D2137]">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading title="Founder" light accentColor="gold" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Photo Area */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-[#4A90E2]/20 to-[#D4AF37]/10 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-[#4A90E2]/20 border border-[#4A90E2]/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#4A90E2]">
                    {founder.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Photo coming soon</p>
              </div>
            </div>
          </div>

          {/* Bio Content */}
          <div className="lg:col-span-3">
            <h3 className="text-2xl font-bold text-white mb-1">{founder.name}</h3>
            <p className="text-[#4A90E2] font-medium mb-5">{founder.role}</p>
            <p className="text-gray-400 leading-relaxed mb-6">{founder.shortBio}</p>
            <div className="flex flex-wrap gap-2">
              {founder.credentials.map((cred) => (
                <Badge key={cred} variant="gold" size="sm">
                  <Award size={12} className="mr-1" />
                  {cred}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
