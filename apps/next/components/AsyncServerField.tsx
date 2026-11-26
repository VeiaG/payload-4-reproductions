// An async server Field component, like one that reads something from the database.
export const AsyncServerField = async () => {
	await new Promise((resolve) => setTimeout(resolve, 100))
	return <div>async server field</div>
}
