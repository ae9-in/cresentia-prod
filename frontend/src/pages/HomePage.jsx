import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const categories = ['All', 'IT', 'Business & Analytics', 'Sales & Soft Skills', 'AI & ML'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [query, setQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState([]);

  useEffect(() => {
    const params = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedLevel !== 'All') params.level = selectedLevel;
    if (query) params.q = query;

    api
      .get('/courses', { params })
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]));
  }, [selectedCategory, selectedLevel, query]);

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
        <h1>Build your future with Learnera</h1>
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
      <section className="grid">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </section>
    </main>
  );
};

export default HomePage;
