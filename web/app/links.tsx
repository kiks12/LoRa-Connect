import { Ambulance, HomeIcon, Hospital, LayoutDashboard, Map, Target, User, Users, Watch } from "lucide-react";

const HOME_LINKS = [
	{ title: "Home", link: "/", icon: <HomeIcon size={32} />, subtitle: "Overview of your system" },
	{ title: "Map", link: "/map", icon: <Map size={32} />, subtitle: "Navigate your connected ecosystem" },
	{ title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={32} />, subtitle: "Analyze performance and trends" },
	{ title: "Missions", link: "/missions", icon: <Target size={32} />, subtitle: "Track active and completed missions" },
	{ title: "Devices", link: "/bracelets", icon: <Watch size={36} />, subtitle: "Manage and assign tracking units" },
	{ title: "Users", link: "/users", icon: <User size={34} />, subtitle: "View registered individuals" },
	{ title: "Rescuers", link: "/rescuers", icon: <Ambulance size={34} />, subtitle: "View registered rescuers" },
	{ title: "Teams", link: "/teams", icon: <Users size={34} />, subtitle: "View rescuer teams" },
	{ title: "Evacuation Centers", link: "/evacuationCenters", icon: <Hospital size={32} />, subtitle: "Manage emergency accommodations" },
];

export default HOME_LINKS;
