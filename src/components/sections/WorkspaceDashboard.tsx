'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ExternalLink,
  FileText,
  Code,
  Database,
  Terminal,
  Layers,
  Settings,
  ChevronDown,
  BookOpen,
  Award,
  HelpCircle,
  GitFork,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { workspaceTools, workspaceCourses } from '@/data/workspace';
import WorkspaceQForm from '@/components/forms/WorkspaceQForm';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

// Icon mapping for Tool Hub
const toolIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Code,
  Database,
  Terminal,
  FileText,
  Layers,
  Settings,
};

// Icon mapping for Resource library types
const resourceIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'project-brief': FileText,
  rubric: Award,
  slides: Layers,
  reading: BookOpen,
  template: GitFork,
  dataset: Database,
  faq: HelpCircle,
};

export default function WorkspaceDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState('applied-ai');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const registered = localStorage.getItem('qf_workspace_registered') === 'true';
    setIsRegistered(registered);
  }, []);

  const handleRegistrationSuccess = () => {
    localStorage.setItem('qf_workspace_registered', 'true');
    setIsRegistered(true);
  };

  const activeCourse = workspaceCourses.find((c) => c.id === activeCourseId) || workspaceCourses[0];

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Sparkles className="animate-spin text-[#4A90E2] mx-auto mb-4" size={32} />
          <p className="text-sm tracking-wider uppercase">Loading Workspace Q...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1929] text-white pt-24 pb-20 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4A90E2]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={12} /> Student Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
            Workspace <span className="bg-gradient-to-r from-[#4A90E2] to-[#D4AF37] bg-clip-text text-transparent">Q</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Your project launchpad. Access high-quality briefs, templates, tools, and datasets curated by Quanta Foundry.
          </p>
        </div>

        {/* Lock Gate Screen */}
        {!isRegistered && (
          <div className="relative mb-20">
            {/* Registration Overlay Card */}
            <div className="absolute inset-0 z-20 flex items-start justify-center pt-8 sm:pt-16 px-4">
              <Card className="p-8 max-w-2xl w-full bg-[#0A1929]/95 backdrop-blur-xl border border-white/10 shadow-2xl relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#D4AF37] flex items-center justify-center shadow-lg">
                  <Lock size={20} className="text-white" />
                </div>
                
                <div className="text-center mt-4 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-3">Unlock Workspace Resources</h2>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    This hub is reserved for coursework students and registered self-learners. Complete the quick form below to unlock immediate access.
                  </p>
                </div>

                <WorkspaceQForm onSuccess={handleRegistrationSuccess} />
              </Card>
            </div>

            {/* Blurred Preview content container */}
            <div className="blur-[5px] opacity-25 select-none pointer-events-none">
              {/* Dummy Tool Hub Preview */}
              <div className="mb-12">
                <h2 className="text-xl font-bold mb-6">Tool Hub</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {workspaceTools.slice(0, 3).map((tool) => (
                    <Card key={tool.id} className="p-5 bg-white/5 border-white/5">
                      <div className="h-10 w-10 rounded-lg bg-white/5 mb-4" />
                      <div className="h-4 bg-white/10 w-1/3 rounded mb-2" />
                      <div className="h-3 bg-white/10 w-3/4 rounded" />
                    </Card>
                  ))}
                </div>
              </div>

              {/* Dummy Resource Library Preview */}
              <div>
                <h2 className="text-xl font-bold mb-6">Resource Library</h2>
                <div className="border border-white/5 rounded-xl p-8 bg-white/5">
                  <div className="h-8 bg-white/10 w-48 rounded mb-6" />
                  <div className="space-y-4">
                    <div className="h-12 bg-white/10 rounded" />
                    <div className="h-12 bg-white/10 rounded" />
                    <div className="h-12 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content - Shown Only When Registered */}
        {isRegistered && (
          <div className="space-y-16 animate-fade-in-up">
            {/* Registered Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#4A90E2]/15 via-white/5 to-[#D4AF37]/15 border border-white/10 shadow-lg shadow-black/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Unlock size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Workspace Unlocked</h3>
                  <p className="text-xs text-gray-400">Welcome! You now have unrestricted access to all resources and guides.</p>
                </div>
              </div>
              <Badge variant="gold" size="md">
                <Sparkles size={12} className="mr-1" /> Student Access Active
              </Badge>
            </div>

            {/* Curated Tool Hub */}
            <section id="tool-hub">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Terminal size={22} className="text-[#4A90E2]" /> Tool Hub
                </h2>
                <Badge variant="info">6 Curated Tools</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaceTools.map((tool) => {
                  const ToolIcon = toolIconMap[tool.icon] || Code;
                  return (
                    <Card
                      key={tool.id}
                      className="p-5 bg-white/5 border-white/5 hover:border-[#4A90E2]/30 hover:bg-white/10 transition-all group flex flex-col justify-between"
                      id={`tool-${tool.id}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-[#4A90E2]/10 flex items-center justify-center text-[#4A90E2]">
                            <ToolIcon size={20} />
                          </div>
                          <Badge variant={tool.category === 'coding' ? 'default' : tool.category === 'data' ? 'info' : 'gold'} size="sm">
                            {tool.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#4A90E2] transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">
                          {tool.description}
                        </p>
                      </div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#4A90E2] font-semibold hover:text-[#6BA4E8] transition-colors mt-auto"
                      >
                        Launch Tool <ExternalLink size={12} />
                      </a>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Resource Library */}
            <section id="resource-library">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen size={22} className="text-[#D4AF37]" /> Resource Library
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Course syllabus, briefs, slides, templates, and datasets.</p>
                </div>
                
                {/* Course Switcher Tabs */}
                <div className="flex rounded-lg bg-white/5 p-1 border border-white/10 self-start md:self-auto">
                  {workspaceCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setActiveCourseId(course.id);
                        setExpandedFaqId(null);
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeCourseId === course.id
                          ? 'bg-[#4A90E2] text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {course.title.split(' ')[0]} {course.title.includes('Quant') ? 'Finance' : 'AI'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Title Banner */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-xl font-bold text-white">{activeCourse.title}</h3>
                  <Badge variant="gold" size="sm">Cohort: {activeCourse.cohort}</Badge>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
                  {activeCourse.description}
                </p>
              </div>

              {/* Resources list grouped by type */}
              <div className="space-y-6">
                {/* 1. Project Briefs & Rubrics */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A90E2] mb-3">Project Materials</h4>
                  <div className="space-y-3">
                    {activeCourse.resources
                      .filter((r) => r.type === 'project-brief' || r.type === 'rubric')
                      .map((res) => {
                        const ResIcon = resourceIconMap[res.type] || FileText;
                        return (
                          <div
                            key={res.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#4A90E2] shrink-0 mt-0.5">
                                <ResIcon size={18} />
                              </div>
                              <div>
                                <h5 className="font-semibold text-white text-sm">{res.title}</h5>
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{res.description}</p>
                              </div>
                            </div>
                            <Button href={res.url} size="sm" className="shrink-0 flex items-center gap-1.5" id={`res-btn-${res.id}`}>
                              Open {res.format === 'pdf' ? 'PDF' : res.format === 'github' ? 'Repository' : 'Link'}
                              <ArrowRight size={12} />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 2. Lecture Slides, Templates & Datasets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Learning Assets */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3">Lecture & Readings</h4>
                    <div className="space-y-3">
                      {activeCourse.resources
                        .filter((r) => r.type === 'slides' || r.type === 'reading')
                        .map((res) => {
                          const ResIcon = resourceIconMap[res.type] || BookOpen;
                          return (
                            <div
                              key={res.id}
                              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col h-full justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]">
                                    <ResIcon size={16} />
                                  </div>
                                  <Badge variant="gold" size="sm">{res.type}</Badge>
                                </div>
                                <h5 className="font-semibold text-white text-sm mb-1">{res.title}</h5>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">{res.description}</p>
                              </div>
                              <a
                                href={res.url}
                                className="inline-flex items-center gap-1 text-xs text-[#D4AF37] font-semibold hover:text-[#E0C35C] transition-colors mt-auto"
                              >
                                View Material <ExternalLink size={10} />
                              </a>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Right: Code & Data */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Code & Datasets</h4>
                    <div className="space-y-3">
                      {activeCourse.resources
                        .filter((r) => r.type === 'template' || r.type === 'dataset')
                        .map((res) => {
                          const ResIcon = resourceIconMap[res.type] || Database;
                          return (
                            <div
                              key={res.id}
                              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col h-full justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400">
                                    <ResIcon size={16} />
                                  </div>
                                  <Badge variant="success" size="sm">{res.type}</Badge>
                                </div>
                                <h5 className="font-semibold text-white text-sm mb-1">{res.title}</h5>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">{res.description}</p>
                              </div>
                              <a
                                href={res.url}
                                className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors mt-auto"
                              >
                                Get Resource <ExternalLink size={10} />
                              </a>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* 3. Syllabus & FAQs */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">FAQs & Pitfalls</h4>
                  <div className="space-y-3">
                    {activeCourse.resources
                      .filter((r) => r.type === 'faq')
                      .map((res) => (
                        <div
                          key={res.id}
                          className="rounded-xl border border-white/5 bg-white/5 overflow-hidden transition-all duration-200"
                        >
                          <button
                            onClick={() => setExpandedFaqId(expandedFaqId === res.id ? null : res.id)}
                            className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-white text-sm hover:bg-white/5"
                          >
                            <span className="flex items-center gap-2">
                              <HelpCircle size={16} className="text-gray-400" />
                              {res.title}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`text-gray-400 transition-transform duration-200 ${
                                expandedFaqId === res.id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {expandedFaqId === res.id && (
                            <div className="p-4 border-t border-white/5 bg-black/10 text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                              {res.content}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
