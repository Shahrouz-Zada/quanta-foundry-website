import { NextResponse, type NextRequest } from 'next/server';
import { recordCourseEvent } from '@/lib/courses';
import { isLikelyBot } from '@/lib/course-files';

// Counts a visit to the /courses page. Called once per browser tab session
// by <CoursePageTracker /> (see components/courses). Downloads and views of
// individual files are counted by their own routes instead.
export async function POST(request: NextRequest) {
  // Only count calls made by our own page, not from other sites. Browsers
  // always send Sec-Fetch-Site; anything else (scripts) is a bot anyway and
  // is filtered by the user-agent check below.
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') {
    return new NextResponse(null, { status: 204 });
  }

  if (!isLikelyBot(request.headers.get('user-agent'))) {
    await recordCourseEvent('PAGE_VIEW');
  }
  return new NextResponse(null, { status: 204 });
}
