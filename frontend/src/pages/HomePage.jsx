import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'IT', 'Business & Analytics', 'Sales & Soft Skills', 'AI & ML'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [query, setQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, refreshUser, hasAccess } = useAuth();

  // Create a stable key from the course IDs
  const coursesKey = user?.assignedCourses?.map(c => 
    typeof c === 'object' ? c._id : c
  ).join(',') || '';

  useEffect(() => {
    const params = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedLevel !== 'All') params.level = selectedLevel;
    if (query) params.q = query;

    console.log('🔄 HomePage: Fetching courses');
    console.log('User role:', user?.role);
    console.log('Assigned courses:', user?.assignedCourses?.length);
    
    setLoading(true);
    api
      .get('/courses', { params })
      .then((res) => {
        console.log('✅ HomePage: Courses loaded:', res.data.length);
        setCourses(res.data);
      })
      .catch((err) => {
        console.error('❌ HomePage: Failed to load courses:', err);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedLevel, query, coursesKey]); // Re-fetch when coursesKey changes

  useEffect(() => {
    if (!query) {
      setAutocomplete([]);
      return;
    }
    const id = setTimeout(() => {
      api
        .get('/courses/search', { params: { q: query } })
        .then((res) => setAutocomplete(res.data.autocomplete || []))
        .catch(() => setAutocomplete([]));
    }, 250);

    return () => clearTimeout(id);
  }, [query]);

  const heading = useMemo(() => {
    if (selectedCategory !== 'All') return `${selectedCategory} Courses`;
    return 'Explore Courses';
  }, [selectedCategory]);

  return (
    <main className="container page">
      <section className="hero">
        <h1>Build your future with Crescentia</h1>
        <p>Browse curated courses, watch lessons, take assessments, and earn your completion certificate.</p>
      </section>

      <section className="filters">
        <div className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or category"
          />
          {autocomplete.length > 0 && (
            <ul className="autocomplete">
              {autocomplete.map((item) => (
                <li key={item}>
                  <button type="button" onClick={() => setQuery(item)}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
          {levels.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </section>

      <h2>{heading}</h2>
      
      {/* Loading State */}
      {loading && (
        <div className="loading-spinner">Loading courses...</div>
      )}

      {/* Empty State - No Courses */}
      {!loading && (!courses || courses.length === 0) && (
        <div className="beautiful-empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">
            {query || selectedCategory !== 'All' || selectedLevel !== 'All'
              ? 'No Courses Found'
              : user?.role === 'admin'
              ? 'No Courses Created Yet'
              : 'No Courses Assigned'}
          </h3>
          <p className="empty-state-description">
            {query || selectedCategory !== 'All' || selectedLevel !== 'All'
              ? 'Try adjusting your filters or search terms to find courses.'
              : user?.role === 'admin'
              ? 'Get started by creating your first course in the Admin Panel.'
              : 'No courses have been assigned to you yet. Please contact an administrator to get course access.'}
          </p>
          <div className="empty-state-actions">
            {(query || selectedCategory !== 'All' || selectedLevel !== 'All') && (
              <button
                className="primary-btn"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                }}
                type="button"
              >
                Clear Filters
              </button>
            )}
            {user?.role === 'admin' && !query && selectedCategory === 'All' && selectedLevel === 'All' && (
              <button
                className="primary-btn"
                onClick={() => window.location.href = '/admin'}
                type="button"
              >
                Go to Admin Panel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && courses && courses.length > 0 && (
        <section className="grid">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </section>
      )}
    </main>
  );
};

export default HomePage;
