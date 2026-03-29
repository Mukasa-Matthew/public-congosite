export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-red-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Privacy</h1>
          <p className="mt-2 text-red-100">How we handle information</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 max-w-3xl text-gray-700 space-y-4">
        <p>
          This site may use standard browser features (such as local storage) to remember preferences—for example,
          articles you save to read later in your browser. That data stays on your device unless you clear it.
        </p>
        <p>
          Our newsletter signup sends your email to our servers only when you submit the form. Use the unsubscribe
          options provided in those emails if available, or contact us to remove your address.
        </p>
        <p className="text-sm text-gray-500">
          This page is a general notice. Your organization should replace it with counsel-approved text where required.
        </p>
      </div>
    </div>
  );
}
