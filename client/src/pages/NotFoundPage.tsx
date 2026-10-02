import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-600 font-bold text-xl flex items-center justify-center mb-4">
        404
      </div>
      <h1 className="text-xl font-bold text-slate-800">Page Not Found</h1>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition shadow-sm"
      >
        Return to Home
      </Link>
    </div>
  );
};
