'use client';
import { PhoneApp } from '@/components/phone/PhoneApp';

export default function Home() {
  return (
    <div id="phone-stage">
      <div className="phone">
        <div className="notch" />
        <div className="phone-root">
          <PhoneApp />
        </div>
      </div>
    </div>
  );
}
