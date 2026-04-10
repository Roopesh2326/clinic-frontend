import React, { useState, useEffect } from "react";
import { 
  Container, Typography, Card, CardContent, CardMedia, Button, 
  Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Box, Chip, InputAdornment, Search, Slider, Rating, Badge
} from "@mui/material";
import { ShoppingCart, Filter, Sort } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const safeReadArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const defaultHomeopathyMedicines = [
  {
    name: "Arnica Montana 30",
    desc: "Useful for bruises, soreness, and injury recovery.",
    price: 120,
    category: "Pain Relief",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Nux Vomica 30",
    desc: "Traditionally used for acidity, bloating, and indigestion support.",
    price: 110,
    category: "Digestive Care",
    img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Belladonna 30",
    desc: "Commonly used for sudden fever and headache tendencies.",
    price: 115,
    category: "Fever & Cold",
    img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Bryonia Alba 30",
    desc: "Supportive medicine for dry cough and body pain discomfort.",
    price: 130,
    category: "Respiratory",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Rhus Tox 30",
    desc: "Often considered for joint stiffness and muscle strain.",
    price: 125,
    category: "Joint Care",
    img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Calendula Q",
    desc: "Used in skin and wound-care supportive routines.",
    price: 160,
    category: "Skin Care",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
  },
];

export default function StoreEnhanced() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(safeReadArray("cart"));
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch medicines from backend
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (priceRange[0] > 0) params.append("minPrice", priceRange[0]);
      if (priceRange[1] < 500) params.append("maxPrice", priceRange[1]);
      params.append("sortBy", sortBy);
      params.append("order", sortOrder);

      const response = await axios.get(`${BASE_URL}/medicines?${params}`, {
        withCredentials: true
      });

      const medicinesData = response.data || defaultHomeopathyMedicines;
      setMedicines(medicinesData);
      setFilteredMedicines(medicinesData);
      
      // Extract categories
      const uniqueCategories = [...new Set(medicinesData.map(m => m?.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error("Error fetching medicines:", error);
      // Fallback to default medicines
      const filtered = filterAndSortMedicines(defaultHomeopathyMedicines);
      setMedicines(defaultHomeopathyMedicines);
      setFilteredMedicines(filtered);
      setCategories([...new Set(defaultHomeopathyMedicines.map(m => m?.category).filter(Boolean))]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort medicines (for fallback)
  const filterAndSortMedicines = (medicinesList) => {
    let filtered = medicinesList.filter(medicine => {
      const matchesSearch = !searchQuery || 
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || medicine.category === selectedCategory;
      const matchesPrice = medicine.price >= priceRange[0] && medicine.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  // Apply filters
  useEffect(() => {
    fetchMedicines();
  }, [searchQuery, selectedCategory, priceRange, sortBy, sortOrder]);

  // Add to cart
  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
    setMessage(`${product.name} added to cart`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 500]);
    setSortBy("name");
    setSortOrder("asc");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#166534", mb: 2 }}>
          Medicine Store
        </Typography>
        
        {/* Search Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<Filter />}
              fullWidth
              sx={{ height: "56px" }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Advanced Filters</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={500}
                  step={10}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Sort Order</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    label="Sort Order"
                  >
                    <MenuItem value="asc">Ascending</MenuItem>
                    <MenuItem value="desc">Descending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button onClick={clearFilters} variant="outlined">
                Clear All Filters
              </Button>
            </Box>
          </Card>
        )}

        {/* Results Summary */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body1">
            Showing {filteredMedicines.length} of {medicines.length} medicines
          </Typography>
          <Badge badgeContent={cart.length} color="primary">
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={() => navigate("/cart")}
            >
              View Cart
            </Button>
          </Badge>
        </Box>
      </Box>

      {/* Message */}
      {message && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: "#4caf50", color: "white", borderRadius: 1 }}>
          {message}
        </Box>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>Loading medicines...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredMedicines.map((medicine, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={medicine.img || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"}
                  alt={medicine.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    {medicine.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {medicine.desc}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Chip 
                      label={medicine.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Typography variant="h6" color="primary">
                      ${medicine.price}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCart />}
                    onClick={() => addToCart(medicine)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Results */}
      {!loading && filteredMedicines.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No medicines found matching your criteria
          </Typography>
          <Button onClick={clearFilters} variant="outlined">
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
}
