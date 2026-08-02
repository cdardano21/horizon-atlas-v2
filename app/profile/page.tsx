import RouteFrame from "../components/RouteFrame";
import { publicDestinations } from "../lib/public-destinations";
import { getProfileSnapshot } from "../lib/profile-data";
import ProfileClient from "../components/ProfileClient";

export default async function ProfilePage() {
  const profile = await getProfileSnapshot();

  return (
    <RouteFrame
      eyebrow="Saved cities"
      title="Your DestinationFinderAI profile"
      description="Favorites, compare lists, and saved cities now live in your browser and will be surfaced from this profile route."
      primaryAction={{ href: "/destinations", label: "Browse destinations" }}
      secondaryAction={{ href: "/compare", label: "Compare cities" }}
    >
      <ProfileClient
        destinations={publicDestinations}
        profile={profile}
      />
    </RouteFrame>
  );
}