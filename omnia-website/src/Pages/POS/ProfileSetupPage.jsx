export default function ProfileSetupPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Profile Setup</h2>
      <p className="mt-1 text-sm text-gray-600">
        Implement this screen with PATCH /auth/me/profile.
      </p>

      <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium">Backend fields:</p>
        <ul className="mt-2 space-y-1">
          <li>email</li>
          <li>full_name</li>
          <li>phone_number</li>
          <li>location</li>
          <li>bio</li>
          <li>date_of_birth (YYYY-MM-DD)</li>
        </ul>
      </div>
    </div>
  );
}
