'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Nav } from './Nav';
import { Hero, Impact } from './Hero';
import { ProjectsSection, ProjectDetailWeb } from './ProjectsSection';
import { AboutSection } from './AboutSection';
import { ContactSection, Footer } from './ContactSection';

export function WebApp() {
  const [theme, setTheme] = useState('light');
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('portfolio-theme', next); } catch (e) {}
  }, [theme]);

  const openProject = useCallback((id: string) => {
    setDetail(id);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeProject = useCallback(() => {
    setDetail(null);
    document.body.style.overflow = '';
  }, []);

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Impact />
        <ProjectsSection onOpen={openProject} />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      {detail && <ProjectDetailWeb id={detail} onClose={closeProject} />}
    </>
  );
}
