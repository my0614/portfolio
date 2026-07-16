'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { ProjectsSection, ProjectDetailWeb } from './ProjectsSection';
import { AboutSection } from './AboutSection';
import { BlogSection } from './BlogSection';
import { BlogDetailWeb } from './BlogDetailWeb';
import { ContactSection, Footer } from './ContactSection';

export function WebApp() {
  const [theme, setTheme] = useState('light');
  const [detail, setDetail] = useState<string | null>(null);
  const [postDetail, setPostDetail] = useState<string | null>(null);

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
    history.pushState({ detail: id }, '', '?project=' + id);
  }, []);

  const closeProject = useCallback(() => {
    setDetail(null);
    document.body.style.overflow = '';
    if (history.state?.detail) history.back();
  }, []);

  const openPost = useCallback((id: string) => {
    setPostDetail(id);
    document.body.style.overflow = 'hidden';
    history.pushState({ post: id }, '', '?post=' + id);
  }, []);

  const closePost = useCallback(() => {
    setPostDetail(null);
    document.body.style.overflow = '';
    if (history.state?.post) history.back();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) {
      setDetail(projectId);
      document.body.style.overflow = 'hidden';
    }
    const postId = params.get('post');
    if (postId) {
      setPostDetail(postId);
      document.body.style.overflow = 'hidden';
    }

    const onPopState = (e: PopStateEvent) => {
      if (e.state?.detail) {
        setDetail(e.state.detail);
        setPostDetail(null);
        document.body.style.overflow = 'hidden';
      } else if (e.state?.post) {
        setPostDetail(e.state.post);
        setDetail(null);
        document.body.style.overflow = 'hidden';
      } else {
        setDetail(null);
        setPostDetail(null);
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
        <BlogSection onOpen={openPost} />
        <ContactSection />
      </main>
      <Footer />
      {detail && <ProjectDetailWeb id={detail} onClose={closeProject} />}
      {postDetail && <BlogDetailWeb id={postDetail} onClose={closePost} />}
    </>
  );
}
