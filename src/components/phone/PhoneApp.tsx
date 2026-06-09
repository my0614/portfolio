'use client';
import React, { useState, useCallback } from 'react';
import { StatusBar } from './StatusBar';
import { HomeScreen } from './HomeScreen';
import { ProjectsScreen } from './ProjectsScreen';
import { AboutScreen } from './AboutScreen';
import { ContactScreen } from './ContactScreen';
import { ProjectDetail } from './ProjectDetail';
import { Icon } from './Icon';

type TabKey = 'home' | 'projects' | 'about' | 'contact';

const TABS: { key: TabKey; label: string; icon: 'home' | 'grid' | 'user' | 'mail' }[] = [
  { key: 'home', label: '홈', icon: 'home' },
  { key: 'projects', label: '프로젝트', icon: 'grid' },
  { key: 'about', label: 'About', icon: 'user' },
  { key: 'contact', label: '연락', icon: 'mail' },
];

export function PhoneApp() {
  const [tab, setTab] = useState<TabKey>('home');
  const [detail, setDetail] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openProject = useCallback((id: string) => {
    setDetail(id);
    setTimeout(() => setDetailOpen(true), 20);
  }, []);

  const goBack = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setDetail(null), 340);
  }, []);

  const goTab = useCallback((t: string) => {
    setTab(t as TabKey);
  }, []);

  let screen: React.ReactNode;
  if (tab === 'home') screen = <HomeScreen key="home" openProject={openProject} goTab={goTab} />;
  else if (tab === 'projects') screen = <ProjectsScreen key="projects" openProject={openProject} />;
  else if (tab === 'about') screen = <AboutScreen key="about" goTab={goTab} />;
  else screen = <ContactScreen key="contact" />;

  return (
    <>
      <StatusBar />
      <div className="viewport">{screen}</div>
      <div className="tabbar">
        {TABS.map(t => (
          <button
            key={t.key}
            className={'tab' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={24} stroke={tab === t.key ? 2.3 : 1.9} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      {detail && (
        <div className={'detail-layer' + (detailOpen ? ' open' : '')}>
          <ProjectDetail id={detail} goBack={goBack} />
        </div>
      )}
    </>
  );
}
