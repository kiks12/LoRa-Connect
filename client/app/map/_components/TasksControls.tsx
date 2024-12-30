import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function TasksControls() {
	return (
		<div>
			<Button className="w-full mt-2">Run Task Allocation</Button>
			<div className="flex justify-between items-center my-2 border rounded-md p-3">
				<Label className="ml-3" htmlFor="automaticTaskAllocation">
					Automatically run task allocation
				</Label>
				<Switch checked={false} id="automaticTaskAllocation" onCheckedChange={() => {}} />
			</div>
		</div>
	);
}
