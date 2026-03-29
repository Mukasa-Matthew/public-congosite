import { useQuery } from '@tanstack/react-query';
import { MdEmail, MdPhone } from 'react-icons/md';
import { settingsService } from '../services/settings';

export default function Contact() {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsService.getPublicSettings(),
    retry: 1,
    staleTime: 60 * 1000,
  });

  const siteName = siteSettings?.site_name || 'Congo News';
  const contactEmail = siteSettings?.contact_email || 'news@congonews.com';
  const contactPhone = siteSettings?.contact_phone || '';

  const tipsMailto = `mailto:${contactEmail}?subject=${encodeURIComponent(`News tip — ${siteName}`)}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-red-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Contact</h1>
          <p className="mt-2 text-red-100">Reach the editorial team</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">General inquiries</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <MdEmail className="w-5 h-5 text-red-600 shrink-0" />
                <a href={`mailto:${contactEmail}`} className="text-red-600 font-medium hover:underline">
                  {contactEmail}
                </a>
              </li>
              {contactPhone && (
                <li className="flex items-center gap-2">
                  <MdPhone className="w-5 h-5 text-red-600 shrink-0" />
                  <a href={`tel:${contactPhone}`} className="text-red-600 font-medium hover:underline">
                    {contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Send a news tip</h2>
            <p className="text-gray-600 text-sm mb-4">
              Have documents, photos, or a story idea? Email the newsroom (you can remain anonymous in the message).
            </p>
            <a
              href={tipsMailto}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Email a tip
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
