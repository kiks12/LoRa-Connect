import DataSection from "./DataSection";

export default function TriDataSection({
	loading,
	firstData,
	firstTitle,
	secondData,
	secondTitle,
	thirdData,
	thirdTitle,
}: {
	loading: boolean;
	firstTitle: string;
	firstData: number;
	secondTitle: string;
	secondData: number;
	thirdTitle: string;
	thirdData: number;
}) {
	return (
		<div>
			<div className="flex flex-col">
				<div className="mb-1 flex-1">
					<DataSection loading={loading} title={firstTitle} data={firstData} />
				</div>
				<div className="my-1 flex-1">
					<DataSection loading={loading} title={secondTitle} data={secondData} />
				</div>
				<div className="mt-1 flex-1">
					<DataSection loading={loading} title={thirdTitle} data={thirdData} />
				</div>
			</div>
		</div>
	);
}
