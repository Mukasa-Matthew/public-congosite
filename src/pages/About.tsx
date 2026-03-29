import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../services/settings';

export default function About() {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsService.getPublicSettings(),
    retry: 1,
    staleTime: 60 * 1000,
  });

  const siteName = siteSettings?.site_name || 'Congo News';

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-red-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">About us</h1>
          <p className="mt-2 text-red-100">Who we are and what we publish</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
          <p>
            <strong>{siteName}</strong> is an independent news platform focused on timely reporting, context, and
            analysis. We aim to keep readers informed with accurate, clearly presented coverage.
          </p>
          {siteSettings?.site_description ? <p>{siteSettings.site_description}</p> : null}
          <p>
            For corrections, tips, or partnership inquiries, please use the contact details in our{' '}
            <Link to="/contact" className="text-red-600 font-semibold hover:underline">
              Contact
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}
