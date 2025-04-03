import { Ambulance, HomeIcon, Hospital, LayoutDashboard, Map, Target, User, Users, Watch } from "lucide-react";

const HOME_LINKS = [
	{ title: "Home", link: "/", icon: <HomeIcon size={40} />, subtitle: "Main navigation of the system" },
	{ title: "Control Panel", link: "/map", icon: <Map size={40} />, subtitle: "Run algorithms and send signals" },
	{ title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={40} />, subtitle: "Analyze performance and trends" },
	{ title: "Missions", link: "/missions", icon: <Target size={44} />, subtitle: "Track active and completed missions" },
	{ title: "Devices", link: "/bracelets", icon: <Watch size={44} />, subtitle: "Manage and assign tracking units" },
	{ title: "Users", link: "/users", icon: <User size={44} />, subtitle: "View registered individuals" },
	{ title: "Rescuers", link: "/rescuers", icon: <Ambulance size={42} />, subtitle: "View registered rescuers" },
	{ title: "Teams", link: "/teams", icon: <Users size={42} />, subtitle: "View rescuer teams" },
	{ title: "Evacuation Centers", link: "/evacuationCenters", icon: <Hospital size={42} />, subtitle: "Manage emergency accommodations" },
];

export default HOME_LINKS;
