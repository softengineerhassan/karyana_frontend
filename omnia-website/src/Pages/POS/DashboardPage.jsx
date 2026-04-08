const cards = [
  {
    title: "Auth",
    points: [
      "POST /auth/login",
      "PATCH /auth/me/profile",
      "POST /auth/verify-otp",
      "POST /auth/forgot-password",
    ],
  },
  {
    title: "Rider Profiles",
    points: [
      "POST /riders",
      "GET /riders",
      "PUT /riders/{rider_id}",
      "DELETE /riders/{rider_id}",
    ],
  },
  {
    title: "Rider Purchase Items",
    points: [
      "POST /rider-purchase-items",
      "GET /rider-purchase-items?rider_profile_id=...",
      "PUT /rider-purchase-items/{item_id}",
      "DELETE /rider-purchase-items/{item_id}",
    ],
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">POS Starter Dashboard</h2>
      <p className="mt-1 text-sm text-gray-600">
        This project is cleaned for POS implementation. Start wiring APIs by module.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <section key={card.title} className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold text-gray-900">{card.title}</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {card.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
