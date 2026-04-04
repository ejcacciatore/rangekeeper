import { db } from '@/lib/db';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Search, 
  ArrowLeft,
  Download,
  AlertCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
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
        <p className="text-gray-500">Please sync from the extension to initialize your audit.</p>
      </div>
    );
  }

  // Calculate some stats
  const totalCourses = student.courses.length;
  const discrepancies = student.courses.reduce((sum, c) => 
    sum + c.advisorChecks.filter(check => check.flag === 'DIFF').length, 0
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-8 shadow-sm sm:px-6 lg:px-8 border-l-[8px] border-[#9E1B32]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#9E1B32]">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold text-[#9E1B32]">High-Fidelity Grade Audit</h1>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                 <div className="flex items-center gap-1.5"><span className="font-bold text-gray-900">Student:</span> {student.name}</div>
                 <div className="flex items-center gap-1.5"><span className="font-bold text-gray-900">Term:</span> Spring 2026</div>
                 <div className="flex items-center gap-1.5"><span className="font-bold text-gray-900">Generated:</span> {new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <div className="hidden sm:block">
              {discrepancies > 0 ? (
                <div className="rounded-xl bg-red-50 px-4 py-2 text-red-700 border border-red-100 flex items-center gap-2 font-bold animate-pulse">
                  <AlertTriangle className="h-5 w-5" />
                  {discrepancies} DISCREPANCIES FOUND
                </div>
              ) : (
                <div className="rounded-xl bg-green-50 px-4 py-2 text-green-700 border border-green-100 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  ALL SYSTEMS NOMINAL
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Summary Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {student.courses.map((course) => (
            <div key={course.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-hover hover:shadow-md">
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">{course.code}</div>
              <div className="text-3xl font-black text-gray-900">B+</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                {course.advisorChecks.some(ch => ch.flag === 'DIFF') ? (
                  <span className="text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Discrepancy</span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Matched</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Course Detailed Sections */}
        <div className="space-y-16">
          {student.courses.map((course) => (
            <section key={course.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                   <h2 className="text-xl font-bold text-gray-900">{course.name}</h2>
                   <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100 uppercase">Blackboard</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">Section: {course.code.split('-').pop()} • Term: 202610</div>
              </div>

              {/* Assignments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/30 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-6 py-3">Assignment</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3 text-right">Pct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {course.assignments.slice(0, 10).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{a.title}</td>
                        <td className="px-6 py-4 text-gray-500">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            a.isSubmitted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {a.isSubmitted ? 'Submitted' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">8.5 / 10</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">85%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advisor Crosscheck Panel */}
              {course.advisorChecks.length > 0 && (
                <div className="border-t-2 border-dashed border-amber-200 bg-amber-50/50 p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-widest">
                    <Search className="h-4 w-4" /> Advisor Crosscheck Engine
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {course.advisorChecks.map((check) => (
                      <div key={check.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm border border-amber-100">
                        <div className={`mt-0.5 rounded-full p-1.5 ${
                          check.flag === 'MATCH' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {check.flag === 'MATCH' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900">{check.claim}</div>
                          <div className="text-xs text-gray-500 italic">Actual: {check.actual}</div>
                          {check.note && <div className="mt-1 text-[11px] font-medium text-amber-800 leading-tight">{check.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pt-24 text-center sm:px-6 lg:px-8">
        <p className="border-t border-gray-100 pt-8 text-xs font-medium text-gray-400 uppercase tracking-widest">
          RangeKeeper v2.0 • High-Fidelity Audit Module • Spring 2026 Edition
        </p>
      </footer>
    </div>
  );
}
