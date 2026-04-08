export default function RiderPurchaseItemsPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Rider Purchase Items</h2>
      <p className="mt-1 text-sm text-gray-600">
        Implement rider purchase item CRUD using /rider-purchase-items endpoints.
      </p>

      <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium">Core fields:</p>
        <ul className="mt-2 space-y-1">
          <li>rider_profile_id</li>
          <li>item_name</li>
          <li>quantity</li>
          <li>unit_price</li>
          <li>total_price (optional)</li>
          <li>purchase_date</li>
          <li>status</li>
          <li>payment_status</li>
        </ul>
      </div>
    </div>
  );
}
