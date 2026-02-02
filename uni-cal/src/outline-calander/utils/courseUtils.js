// Utility functions for course management

/**
 * Check if a course is a duplicate
 * @param {Object} newCourse - Course to check
 * @param {Array} existingCourses - List of already imported courses
 * @returns {boolean} - Whether course is a duplicate
 */
export function isDuplicateCourse(newCourse, existingCourses) {
  return existingCourses.some(existingCourse => {
    // Match by title and code combination
    const titleMatch = existingCourse.title.toLowerCase().trim() === newCourse.title.toLowerCase().trim();
    const codeMatch = existingCourse.code?.toLowerCase().trim() === newCourse.code?.toLowerCase().trim();
    
    // Consider it a duplicate if both title and code match (or if code is missing, just title)
    if (newCourse.code && existingCourse.code) {
      return titleMatch && codeMatch;
    }
    return titleMatch;
  });
}

/**
 * Filter out duplicate courses from a list
 * @param {Array} newCourses - Courses to filter
 * @param {Array} existingCourses - Already imported courses
 * @returns {Array} - Non-duplicate courses
 */
export function filterDuplicateCourses(newCourses, existingCourses) {
  return newCourses.filter(course => {
    const isDuplicate = isDuplicateCourse(course, existingCourses);
    if (isDuplicate) {
      console.warn('Duplicate course detected and skipped:', course.title, course.code);
    }
    return !isDuplicate;
  });
}

/**
 * Format course data for display
 * @param {Object} course - Course object
 * @returns {Object} - Formatted course info
 */
export function formatCourseInfo(course) {
  return {
    title: course.title || course.code || 'Unnamed Course',
    code: course.code,
    timestamp: course.timestamp || Date.now()
  };
}
