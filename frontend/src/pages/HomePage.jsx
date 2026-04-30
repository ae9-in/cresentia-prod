import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const getVideoType = (url = '') => (url.includes('drive.google.com') ? 'drive' : url ? 'video' : '');

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [resolvedDurations, setResolvedDurations] = useState({});
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedLevel !== 'All') params.level = selectedLevel;
        if (query) params.q = query;

        const [courseRes, enrollmentRes] = await Promise.allSettled([
          api.get('/courses', { params }),
          api.get('/enrollments')
        ]);

        setCourses(courseRes.status === 'fulfilled' ? courseRes.value.data : []);
        setEnrollments(enrollmentRes.status === 'fulfilled' ? enrollmentRes.value.data : []);
      } catch (error) {
        console.error('Failed to load courses:', error);
        setCourses([]);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedLevel, query]);

  useEffect(() => {
    if (!courses.length) {
      setResolvedDurations({});
      return;
    }

    let isCancelled = false;

    const loadCourseDurations = async () => {
      const entries = await Promise.all(
        courses.map(async (course) => {
          const videos = course.videos || [];

          const videoDurations = await Promise.all(
            videos.map(
              (video) =>
                new Promise((resolve) => {
                  if (getVideoType(video.url) !== 'video') {
                    resolve(null);
                    return;
                  }

                  const media = document.createElement('video');
                  media.preload = 'metadata';
                  media.src = video.url.trim();

                  const cleanup = () => {
                    media.removeAttribute('src');
                    media.load();
                  };

                  media.onloadedmetadata = () => {
                    const minutes = Number.isFinite(media.duration) ? Math.max(1, Math.ceil(media.duration / 60)) : null;
                    cleanup();
                    resolve(minutes);
                  };

                  media.onerror = () => {
                    cleanup();
                    resolve(null);
                  };
                })
            )
          );

          const resolvedValues = videoDurations.filter((value) => typeof value === 'number');
          const unresolvedCount = videos.length - resolvedValues.length;

          return [
            course._id,
            {
              minutes: resolvedValues.reduce((sum, value) => sum + value, 0),
              unresolvedCount
            }
          ];
        })
      );

      if (!isCancelled) {
        setResolvedDurations(Object.fromEntries(entries));
      }
    };

    loadCourseDurations();

    return () => {
      isCancelled = true;
    };
  }, [courses]);

  const courseCards = useMemo(() => {
    return courses.map((course) => {
      const enrollment = enrollments.find((item) => item.course?._id === course._id);
      const durationInfo = resolvedDurations[course._id];
      let durationLabel = 'Loading duration...';

      if (durationInfo) {
        durationLabel =
          durationInfo.unresolvedCount > 0
            ? `${durationInfo.minutes} mins+`
            : `${durationInfo.minutes} mins`;
      }

      return {
        ...course,
        lessonCount: course.videos?.length || 0,
        durationLabel,
        progressPercent: enrollment?.progressPercent || 0,
        status:
          enrollment?.progressPercent === 100
            ? 'Completed'
            : enrollment?.progressPercent > 0
            ? 'In Progress'
            : 'Not Started'
      };
    });
  }, [courses, enrollments, resolvedDurations]);

  return (
    <main className="container page">
      <section className="hero courses-hero">
        <div>
          <h1>Courses</h1>
          <p>
            Browse every Cresantia learning track, resume where you left off, and unlock the assessment and certificate flow after completion.
          </p>
        </div>
        <div className="courses-hero-stats">
          <div className="card">
            <strong>{courseCards.length}</strong>
            <span>Categories</span>
          </div>
          <div className="card">
            <strong>{enrollments.filter((item) => item.progressPercent > 0 && item.progressPercent < 100).length}</strong>
            <span>In Progress</span>
          </div>
          <div className="card">
            <strong>{enrollments.filter((item) => item.progressPercent === 100).length}</strong>
            <span>Completed</span>
          </div>
        </div>
      </section>

      <section className="filters">
        <div className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search course categories or lesson titles"
          />
        </div>

        <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
          {levels.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>

        <div className="card courses-filter-card">
          <strong>{courseCards.reduce((sum, course) => sum + (course.lessonCount || 0), 0)}</strong>
          <span>Total Lessons</span>
        </div>
      </section>

      {loading && <div className="loading-spinner">Loading courses...</div>}

      {!loading && courseCards.length === 0 && (
        <div className="beautiful-empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No courses found</h3>
          <p className="empty-state-description">
            Try another search or level filter. The course landing page reads directly from the backend catalog.
          </p>
        </div>
      )}

      {!loading && courseCards.length > 0 && (
        <section className="grid courses-grid">
          {courseCards.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </section>
      )}
    </main>
  );
};

export default HomePage;
