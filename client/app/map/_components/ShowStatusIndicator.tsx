export default function ShowStatusIndicator({ show }: { show: boolean }) {
	return <div className={`h-[7px] w-[7px] rounded-full ${show ? "bg-emerald-500" : "bg-red-500"}`}></div>;
}
