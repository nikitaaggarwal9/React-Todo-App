import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ToastContainer,
	toast,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Classes from "./style.module.css";
import {
	addTaskHandler,
	deleteTask,
	fetchTodo,
	updateTask,
} from "./utils.js";

function App() {
	// setting up loading state
	const [isLoading, setisLoading] =
		useState(true);
	// setting up todo state
	const [Todo, setTodo] = useState([]);
	// setting up editing state
	const [isEdit, setisEdit] = useState({
		edit: false,
		task: {},
	});
	// setting up the userId
	const userId = 1;

	// Function to mark/unmark a task as done/undone
	async function completed(task) {
		const index = Todo.findIndex((elm) => {
			return elm.id === task.id;
		});

		setTodo((prev) => {
			prev[index].completed =
				!prev[index].completed;
			return [...prev];
		});

		if (Todo[index].completed) {
			toast.success(
				"Task Completed Succesfully!"
			);
		} else {
			toast.info(
				"Task Pending!"
			);
		}
	}

	// Function to update a task
	async function updateHandler(
		task,
		requested
	) {
		if (requested) {
			setisEdit({
				edit: true,
				task,
			});
			return;
		}

		const data = await updateTask(task);
		if (data.success) {
			toast.success(
				"Task updated succesfully!"
			);
		} else {
			toast.error(`${data.message}`);
		}

		setisEdit({
			edit: false,
			task: {},
		});
	}

	// Function to delete a particular task
	async function deleteHandler(id) {
		const result = await deleteTask(id);
		if (result.success) {
			const todo = Todo.filter((data) => {
				return data.id !== id;
			});
			setTodo(todo);
			toast.success(
				"Task deleted succesfully!"
			);
		} else {
			toast.error(`${result.message}`);
		}
	}

	// Functiona to add a new task
	async function addData(title) {
		const data = await addTaskHandler(
			title,
			userId
		);
		if (data.success) {
			setTodo([data.data, ...Todo]);
			toast.success(
				"Task added succesfully!"
			);
		} else {
			toast.error(`${data.message}`);
		}
	}

	// useEffect hook for fecthing all todo after the component renders
	useEffect(() => {
		async function post() {
			try {
				const data = await fetchTodo();
				if (data.success) {
					setisLoading(false);
					setTodo(data.data);
				} else {
					setisLoading(false);
					toast.error(`${data.message}`);
				}
			} catch (err) {
				console.log(err);
			}
		}

		post();
	}, []);

	const title = useRef();

	// useEffect to check whether we are edinting any task or not
	useEffect(() => {
		title.current.value = isEdit.edit
			? isEdit.task.title
			: "";
	}, [isEdit]);

	useEffect(() => {
		console.log(Todo);
	}, [Todo, setTodo, completed]);

	return (
		<>
			<ToastContainer />
			<div className={Classes.app}>
				<h1>TODO APP</h1>
				<div
					className={
						Classes.taskContainer
					}>
					{/* Form to add new task  */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							addData(
								title.current
									.value
							);
							title.current.value =
								"";
						}}>
						<div
							className={
								Classes.input
							}>
							<input
								ref={title}
								type="text"
								required
								placeholder="Enter New Task here!"
							/>
						</div>
						<div>
							{/* checking for editing state or not */}
							{isEdit.edit ? (
								<button
									type="button"
									onClick={() => {
										const task =
											isEdit.task;
										task.title =
											title.current.value;
										updateHandler(
											task,
											false
										);
									}}>
									Save
								</button>
							) : (
								<button type="submit">
									ADD TASK
								</button>
							)}
						</div>
					</form>
				</div>
				{/* Tasks Container */}
				{isLoading ? (
					<Spinner />
				) : (
					<div
						className={
							Classes.taskBox
						}>
						{/* mapping over all the post and rendering all the data */}
						{Todo.map((post) => {
							return (
								<div
									key={post.id}
									className={
										Classes.task
									}>
									<span>
										{
											post.title
										}
									</span>
									{/* actions that can performed on a task */}
									<div
										className={
											Classes.icons
										}>
										<div
											className={
												Classes.icon
											}>
											<ion-icon
												onClick={() => {
													updateHandler(
														post,
														true
													);
												}}
												name="create-outline"></ion-icon>
										</div>
										<div
											className={
												Classes.icon
											}>
											<ion-icon
												onClick={() => {
													deleteHandler(
														post.id
													);
												}}
												name="trash-outline"></ion-icon>
										</div>
										<div
											className={
												Classes.icon
											}>
											<ion-icon
												onClick={() => {
													completed(
														post
													);
												}}
												name={
													post.completed
														? "checkmark-done-circle"
														: "checkmark-done-circle-outline"
												}></ion-icon>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}

// spinner to display while data hasn't been fetched
const Spinner = () => {
	return (
		<div className="d-flex justify-content-center">
			<div
				className="spinner-border"
				role="status">
				<span className="visually-hidden">
					Loading...
				</span>
			</div>
		</div>
	);
};

export default App;