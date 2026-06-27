/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/resume.pdf',
        headers: [
          {
            key: 'Content-Disposition',
            value: "attachment; filename*=UTF-8''%EA%B9%80%EB%AF%BC%EC%98%81_%EC%9D%B4%EB%A0%A5%EC%84%9C.pdf",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
