import { Link } from "react-router";

function ErrorBoundary() {
  return (
    <div>
      <h1>An error occurred</h1>
      <Link to="/">Go back to the Homepage</Link>
    </div>
  );
}

export default ErrorBoundary;
