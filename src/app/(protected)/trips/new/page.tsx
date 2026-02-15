import { TripForm } from "@/components/trips/TripForm";

export const metadata = {
  title: "Новая поездка — Travel World",
};

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <TripForm defaultCountryCode={country} />
    </div>
  );
}
