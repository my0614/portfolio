'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { ProjectsSection, ProjectDetailWeb } from './ProjectsSection';
import { AboutSection } from './AboutSection';
import { ContactSection, Footer } from './ContactSection';
import { useTheme } from './hooks';

export function WebApp() {
  const [theme, toggleTheme] = useTheme();
  const [detail, setDetail] = useState<string | null>(null);

  const openProject = useCallback((id: string) => {
    setDetail(id);
    document.body.style.overflow = 'hidden';
    history.pushState({ detail: id }, '', '?project=' + id);
  }, []);

  const closeProject = useCallback(() => {
    setDetail(null);
    document.body.style.overflow = '';
    if (history.state?.detail) history.back();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) {
      setDetail(projectId);
      document.body.style.overflow = 'hidden';
    }

    const onPopState = (e: PopStateEvent) => {
      if (e.state?.detail) {
        setDetail(e.state.detail);
        document.body.style.overflow = 'hidden';
      } else {
        setDetail(null);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <AboutSection />
        <ProjectsSection onOpen={openProject} />
        <ContactSection />
      </main>
      <Footer />
      {detail && <ProjectDetailWeb id={detail} onClose={closeProject} />}
    </>
  );
}
