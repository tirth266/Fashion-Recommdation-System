from flask import Blueprint, request, jsonify, session
from ..database.mongodb import (
    get_products,
    get_product_by_id,
    get_unique_categories,
    get_unique_brands,
    add_search_history,
)
import base64
from io import BytesIO
from PIL import Image
import random

bp = Blueprint("search", __name__, url_prefix="/api/search")


def get_session_user():
    """Get current session user."""
    return session.get("user")


def get_user_id():
    """Get user ID from session."""
    user = get_session_user()
    return user.get("user_id") if user else None


def _get_match_reason(query, product):
    """Generate a reason for why the product matches the search query."""
    query_lower = query.lower()
    name = product.get("name", "").lower()
    description = product.get("description", "").lower()
    category = product.get("category", "").lower()
    brand = product.get("brand", "").lower()

    if query_lower in name:
        return f"Product name contains '{query}'"
    elif query_lower in description:
        return f"Product description contains '{query}'"
    elif query_lower in category:
        return f"Product category is '{product.get('category')}'"
    elif query_lower in brand:
        return f"Product brand is '{product.get('brand')}'"
    else:
        return "Relevant search result"


@bp.route("/text", methods=["POST"])
def text_search():
    """Text-based product search."""
    try:
        user_id = get_user_id()
        data = request.get_json()

        if not data or not data.get("query"):
            return jsonify({"error": "Search query is required"}), 400

        query = data["query"].lower()

        products = get_products({"search_term": query})

        results = []
        for product in products:
            name = product.get("name", "").lower()
            desc = product.get("description", "").lower()
            cat = product.get("category", "").lower()
            brand = product.get("brand", "").lower()

            name_match = query in name
            desc_match = query in desc
            cat_match = query in cat
            brand_match = query in brand

            score = 0.0
            if name_match:
                score += 0.4
            if desc_match:
                score += 0.2
            if cat_match:
                score += 0.25
            if brand_match:
                score += 0.15

            results.append(
                {
                    "product": product,
                    "similarity_score": round(score, 2),
                    "match_reason": _get_match_reason(query, product),
                }
            )

        results.sort(key=lambda x: x["similarity_score"], reverse=True)

        if user_id:
            add_search_history(user_id, "text_search", query, len(results))

        return jsonify(
            {"query": query, "results": results, "total_results": len(results)}
        ), 200

    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route("/image", methods=["POST"])
def image_search():
    """Image-based product search (mock implementation)."""
    try:
        user_id = get_user_id()
        data = request.get_json()

        if not data or not data.get("image_data"):
            return jsonify({"error": "Image data is required"}), 400

        try:
            image_data = base64.b64decode(data["image_data"])
            image = Image.open(BytesIO(image_data))
        except Exception:
            return jsonify({"error": "Invalid image data"}), 400

        mock_categories = ["Outerwear", "Bottoms", "Tops", "Dresses", "Footwear"]
        detected_category = random.choice(mock_categories)

        similar_products = get_products({"category": detected_category})

        results = []
        for product in similar_products:
            similarity_score = random.uniform(0.7, 0.95)
            results.append(
                {
                    "product": product,
                    "similarity_score": round(similarity_score, 2),
                    "detected_category": detected_category,
                    "match_reason": f"Similar {detected_category} style",
                }
            )

        results.sort(key=lambda x: x["similarity_score"], reverse=True)

        if user_id:
            add_search_history(
                user_id, "image_search", f"image_{detected_category}", len(results)
            )

        return jsonify(
            {
                "detected_category": detected_category,
                "results": results,
                "total_results": len(results),
                "message": "Image analyzed successfully",
            }
        ), 200

    except Exception as e:
        print(f"Image search error: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route("/price-comparison", methods=["POST"])
def price_comparison():
    """Price comparison for a product."""
    try:
        user_id = get_user_id()
        data = request.get_json()

        if not data or not data.get("product_id"):
            return jsonify({"error": "Product ID is required"}), 400

        product = get_product_by_id(data["product_id"])

        if not product:
            return jsonify({"error": "Product not found"}), 404

        retailers = [
            {
                "name": "Fashion Hub Premium",
                "price": round(product.get("price", 0) * 0.95, 2),
                "stock": "In Stock",
                "rating": 4.8,
            },
            {
                "name": "Style Marketplace",
                "price": round(product.get("price", 0) * 1.05, 2),
                "stock": "In Stock",
                "rating": 4.6,
            },
            {
                "name": "Trendy Outlet",
                "price": round(product.get("price", 0) * 0.90, 2),
                "stock": "Low Stock",
                "rating": 4.4,
            },
            {
                "name": "Fashion Central",
                "price": round(product.get("price", 0) * 1.10, 2),
                "stock": "Out of Stock",
                "rating": 4.7,
            },
            {
                "name": "Elite Fashion",
                "price": round(product.get("price", 0) * 0.85, 2),
                "stock": "In Stock",
                "rating": 4.9,
            },
        ]

        in_stock_retailers = [r for r in retailers if r["stock"] == "In Stock"]
        best_deal = (
            min(in_stock_retailers, key=lambda x: x["price"])
            if in_stock_retailers
            else None
        )

        if user_id:
            add_search_history(
                user_id,
                "price_comparison",
                f"product_{data['product_id']}",
                len(retailers),
            )

        return jsonify(
            {
                "product": product,
                "comparisons": retailers,
                "best_deal": best_deal,
                "total_comparisons": len(retailers),
            }
        ), 200

    except Exception as e:
        print(f"Price comparison error: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route("/filter", methods=["POST"])
def filtered_search():
    """Filtered product search."""
    try:
        user_id = get_user_id()
        data = request.get_json() or {}

        filters = {}
        if data.get("category"):
            filters["category"] = data["category"]
        if data.get("brand"):
            filters["brand"] = data["brand"]
        if data.get("min_price"):
            filters["min_price"] = data["min_price"]
        if data.get("max_price"):
            filters["max_price"] = data["max_price"]
        if data.get("search_term"):
            filters["search_term"] = data["search_term"]

        products = get_products(filters)
        results = [
            {"product": p, "similarity_score": 1.0, "match_reason": "Filter match"}
            for p in products
        ]

        if user_id:
            search_query = (
                f"filter_{data.get('category', 'all')}_{data.get('brand', 'all')}"
            )
            add_search_history(user_id, "filtered_search", search_query, len(results))

        return jsonify(
            {"results": results, "total_results": len(results), "filters_applied": data}
        ), 200

    except Exception as e:
        print(f"Filtered search error: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route("/categories", methods=["GET"])
def get_categories():
    """Get all unique product categories."""
    try:
        categories = get_unique_categories()
        return jsonify({"categories": categories, "total": len(categories)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/brands", methods=["GET"])
def get_brands():
    """Get all unique product brands."""
    try:
        brands = get_unique_brands()
        return jsonify({"brands": brands, "total": len(brands)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/all", methods=["GET"])
def get_all_products():
    """Get all products with optional pagination."""
    try:
        limit = request.args.get("limit", 100, type=int)
        products = get_products(limit=limit)
        return jsonify({"products": products, "total": len(products)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
