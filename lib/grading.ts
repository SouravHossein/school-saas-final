// Grading utility functions for calculating grades, GPA, and pass/fail status

export interface GradeConfig {
  maxMarks: number
  passingMarks: number
}

export interface GradeResult {
  grade: string
  isPassed: boolean
  percentage: number
}

// Default grade scale: A+ (90-100), A (80-89), A- (70-79), B (60-69), C (50-59), F (Below 50)
export const defaultGradeScale: { [key: string]: { min: number; max: number } } = {
  'A+': { min: 90, max: 100 },
  A: { min: 80, max: 89 },
  'A-': { min: 70, max: 79 },
  B: { min: 60, max: 69 },
  C: { min: 50, max: 59 },
  F: { min: 0, max: 49 },
}

/**
 * Calculate grade based on marks obtained
 * @param marksObtained - Marks obtained by student
 * @param config - Grade configuration with maxMarks and passingMarks
 * @param gradeScale - Optional custom grade scale
 * @returns Grade result with grade letter, pass status, and percentage
 */
export function calculateGrade(
  marksObtained: number,
  config: GradeConfig,
  gradeScale = defaultGradeScale
): GradeResult {
  const percentage = (marksObtained / config.maxMarks) * 100
  const isPassed = marksObtained >= config.passingMarks

  let grade = 'F'
  for (const [gradeLetter, range] of Object.entries(gradeScale)) {
    if (percentage >= range.min && percentage <= range.max) {
      grade = gradeLetter
      break
    }
  }

  return {
    grade,
    isPassed,
    percentage: Math.round(percentage),
  }
}

/**
 * Calculate GPA (Grade Point Average) based on multiple marks
 * @param marks - Array of marks obtained
 * @param config - Grade configuration
 * @returns GPA value (0-4.0 scale)
 */
export function calculateGPA(marks: number[], config: GradeConfig): number {
  if (marks.length === 0) return 0

  const gradePoints: { [key: string]: number } = {
    'A+': 4.0,
    A: 3.9,
    'A-': 3.7,
    B: 3.0,
    C: 2.0,
    F: 0.0,
  }

  const totalPoints = marks.reduce((sum, mark) => {
    const result = calculateGrade(mark, config)
    return sum + (gradePoints[result.grade] || 0)
  }, 0)

  return parseFloat((totalPoints / marks.length).toFixed(2))
}

/**
 * Get grade color for UI display
 * @param grade - Grade letter
 * @returns Tailwind color class
 */
export function getGradeColor(grade: string): string {
  const colorMap: { [key: string]: string } = {
    'A+': 'text-green-700 bg-green-50',
    A: 'text-green-600 bg-green-50',
    'A-': 'text-green-500 bg-green-50',
    B: 'text-blue-600 bg-blue-50',
    C: 'text-yellow-600 bg-yellow-50',
    F: 'text-red-600 bg-red-50',
  }
  return colorMap[grade] || 'text-gray-600 bg-gray-50'
}

/**
 * Get status badge for pass/fail
 * @param isPassed - Pass status
 * @returns Status text and color
 */
export function getPassStatus(isPassed: boolean): { text: string; color: string } {
  return isPassed
    ? { text: 'Passed', color: 'text-green-600 bg-green-50' }
    : { text: 'Failed', color: 'text-red-600 bg-red-50' }
}

/**
 * Calculate class average for an exam
 * @param allMarks - All marks for the exam
 * @param maxMarks - Maximum marks for the exam
 * @returns Average percentage
 */
export function calculateClassAverage(allMarks: number[], maxMarks: number): number {
  if (allMarks.length === 0) return 0
  const total = allMarks.reduce((sum, mark) => sum + mark, 0)
  const average = (total / (allMarks.length * maxMarks)) * 100
  return Math.round(average)
}

/**
 * Get performance statistics for a class exam
 * @param allMarks - All marks for the exam
 * @param passingMarks - Passing marks threshold
 * @returns Performance stats
 */
export function getPerformanceStats(
  allMarks: number[],
  passingMarks: number
): {
  totalStudents: number
  passedStudents: number
  failedStudents: number
  passPercentage: number
  topScore: number
  lowestScore: number
} {
  const totalStudents = allMarks.length
  const passedStudents = allMarks.filter((mark) => mark >= passingMarks).length
  const failedStudents = totalStudents - passedStudents

  return {
    totalStudents,
    passedStudents,
    failedStudents,
    passPercentage: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0,
    topScore: Math.max(...allMarks, 0),
    lowestScore: allMarks.length > 0 ? Math.min(...allMarks) : 0,
  }
}
