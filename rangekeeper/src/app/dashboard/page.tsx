import { db } from '@/lib/db';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  MessageSquare, 
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const studentId = 'massimo_mcrae';
  
  // 1. Fetch Data
  const student = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      courses: {
        include: {
          assignments: {
            orderBy: { dueDate: 'asc' }
          },
          advisorChecks: true
        }
      }
    }
  });

  if (!student) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">No Profile Found</h1>
        <p className="text-gray-500">Please sync from the extension to initialize your dashboard.</p>
      </div>
    );
  }

  const allAssignments = student.courses.flatMap(c => 
    c.assignments.map(a => ({ ...a, courseName: c.name, courseCode: c.code }))
  );

  const now = new Date();
  const burningTasks = allAssignments.filter(a => {
    if (!a.dueDate || a.isSubmitted) return false;
    const diff = (new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
    return diff > 0 && diff < 48; // Due within 48h
  });

  const upcomingTasks = allAssignments.filter(a => {
    if (!a.dueDate || a.isSubmitted) return false;
    const diff = (new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
    return diff >= 48 && diff < 168; // Due within 1 week
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9E1B32] shadow-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#2D2926]">Command Center</h1>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/audit" className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
               Grade Audit
             </Link>
             <div className="h-8 w-8 rounded-full bg-[#9E1B32]/10 flex items-center justify-center text-[#9E1B32] font-bold">
               M
             </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        
        {/* Welcome Block */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[#2D2926]">Welcome back, Massimo.</h2>
          <p className="mt-1 text-gray-500">You have {burningTasks.length} urgent tasks requiring your attention today.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column: Burning Tasks */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Burning Page Board */}
            <section className="overflow-hidden rounded-3xl border border-orange-100 bg-orange-50/30 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                    <Flame className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-900">The Burning Page</h3>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600/60">Urgent Logic Attached</span>
              </div>

              <div className="space-y-4">
                {burningTasks.length > 0 ? (
                  burningTasks.map((task) => (
                    <div key={task.id} className="group flex items-center justify-between rounded-2xl border border-white bg-white p-4 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{task.title}</h4>
                          <div className="flex gap-2 items-center text-sm text-gray-500 italic">
                            <span>{task.courseCode}</span>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">Due in {Math.round((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60))}h</span>
                          </div>
                        </div>
                      </div>
                      <button className="rounded-xl border border-gray-100 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50">
                        Start Now
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-gray-900 font-bold">No Fires Caught!</p>
                    <p className="text-sm text-gray-500">Everything is currently on schedule.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Weekly Planner */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">This Week</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="rounded-2xl border border-gray-50 bg-gray-50/50 p-4">
                    <span className="text-xs font-bold uppercase text-gray-400">{day}</span>
                    <div className="mt-2 text-sm font-bold text-gray-900">
                      {/* Sub-logic for day counting */}
                      0 Tasks
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Insights & Stats */}
          <div className="space-y-8">
            
            {/* Grade Health */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
               <div className="mb-4 flex items-center justify-between text-gray-900">
                 <h3 className="font-bold">Grade Health</h3>
                 <TrendingUp className="h-5 w-5 text-[#9E1B32]" />
               </div>
               <div className="space-y-4">
                 {student.courses.slice(0, 3).map(course => (
                   <div key={course.id} className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 truncate max-w-[120px]">{course.name}</span>
                     <span className="font-bold text-gray-900">B+ (88.4%)</span>
                   </div>
                 ))}
               </div>
               <hr className="my-4 border-gray-50" />
               <Link href="/audit" className="flex items-center justify-center gap-2 text-sm font-bold text-[#9E1B32] hover:underline">
                 Full Audit Report <ChevronRight className="h-4 w-4" />
               </Link>
            </section>

            {/* Recent Messages */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
               <div className="mb-4 flex items-center gap-2 text-gray-900">
                 <MessageSquare className="h-5 w-5 text-blue-500" />
                 <h3 className="font-bold">Recent Messages</h3>
               </div>
               <div className="space-y-4">
                 <div className="rounded-2xl bg-gray-50 p-3 text-xs">
                    <p className="font-bold text-gray-900">Prof. Schmidt (PH-101)</p>
                    <p className="line-clamp-2 text-gray-500">I have posted the solutions for Exam 2 on Blackboard. Please review...</p>
                 </div>
               </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
