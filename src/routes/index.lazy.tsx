
import { createLazyFileRoute } from "@tanstack/react-router";
import { MainLayout } from "../layouts/MainLayout";

export const Route = createLazyFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="p-2">
			<MainLayout />
		</div>
	);
}
