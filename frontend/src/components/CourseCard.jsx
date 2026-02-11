import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <article className="card">
      <div className="chip">{course.category}</div>
      <h3>{course.title}</h3>
      <p>{course.description.slice(0, 110)}...</p>
      <div className="meta-row">
        <span>{course.level}</span>
        <span>{course.durationMinutes} mins</span>
        <span>Rating {course.ratingAverage || 0}</span>
      </div>
      <Link className="primary-btn" to={`/courses/${course._id}`}>
        View Course
      </Link>
    </article>
  );
};

export default CourseCard;
