import { useEffect, useState } from "react";
import { useParams, Link } from 'react-router';
import { getCategories } from "../api/categories";

export default function CategoryDetailPage() {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        let isActive = true;
        getCategories(id)
        .then((data) => isActive && setCategory(data))
        .catch((err) => isActive && setError(err.message));
        return () => {
            isActive = false;
        };
    }, [id]);

    if (error) return <p className='text-red-500'>{error}</p>;
    if (!category) return <p>Loading...</p> //loading 

    return (
        <section>
            <Link to="/categories" className="text-sm text-(--accent)">
            Back to categories
            </Link>
            <h1 className="mt-4 text-3xl font-semibold text-(--text-h)">
                {category.name}
            </h1>
            <p className="mt-2">{category.type}</p>
            <p className="mt-4 text-sm">Budget: ${category.budget}</p>
        </section>
    )
    
}