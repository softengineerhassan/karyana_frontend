export default function RidersPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Rider Profiles</h2>
      <p className="mt-1 text-sm text-gray-600">
        Implement rider CRUD using /riders endpoints.
      </p>

      <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium">Rider fields:</p>
        <ul className="mt-2 space-y-1">
          <li>full_name</li>
          <li>phone_number</li>
          <li>email</li>
          <li>profile_image</li>
        </ul>
      </div>
    </div>
  );
}
