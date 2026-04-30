import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const buttonLabel = course.progressPercent > 0 ? 'Continue' : 'Start Learning';

  return (
    <article className="card course-card modern-course-card">
      <div className="course-thumbnail">
        <img src={course.thumbnail} alt={course.title} />
        <div className="course-thumbnail-overlay" />
        <div className="chip-overlay">{course.level}</div>
        <div className="course-progress-pill">{course.progressPercent || 0}%</div>
      </div>

      <div className="course-content">
        <div className="course-copy">
          <p className="course-category-label">{course.category}</p>
          <h3>{course.title}</h3>
          <p className="course-description">{course.description}</p>
        </div>

        <div className="course-summary-row">
          <span>{course.lessonCount || 0} lessons</span>
          <span>{course.durationLabel || 'Loading duration...'}</span>
          <span>{course.status}</span>
        </div>

        <div className="progress-strip">
          <div className="progress-strip-bar" style={{ width: `${course.progressPercent || 0}%` }} />
        </div>

        <Link className="primary-btn start-course-btn" to={`/courses/${course._id}`}>
          {buttonLabel}
        </Link>
      </div>
    </article>
  );
};

export default CourseCard;
