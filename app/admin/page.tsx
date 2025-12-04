'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';
import AdminHomeSettings from '@/components/AdminHomeSettings';
import AdminProductFeaturing from '@/components/AdminProductFeaturing';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Tab data states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [branding, setBranding] = useState<any>(null);
  const [tabLoading, setTabLoading] = useState(false);
  
  // Banner modal and form states
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    location: 'hero',
    ctaText: '',
    ctaLink: '',
    isActive: true,
  });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [currentBannerImageUrl, setCurrentBannerImageUrl] = useState<string>('');
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerFormLoading, setBannerFormLoading] = useState(false);

  // Product modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    featured: false,
    discount: 0,
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [currentProductImageUrl, setCurrentProductImageUrl] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormLoading, setProductFormLoading] = useState(false);

  // Category modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [currentCategoryImageUrl, setCurrentCategoryImageUrl] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);

  // Order detail modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);

        if (parsedUser.role !== 'admin') {
          router.push('/');
          return;
        }

        setUser(parsedUser);

        // Fetch admin stats
        const response = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    // Fetch data for the new tab if not already loaded
    if (tabName === 'products' && products.length === 0) fetchTabData('products');
    if (tabName === 'categories' && categories.length === 0) fetchTabData('categories');
    if (tabName === 'orders' && orders.length === 0) fetchTabData('orders');
    if (tabName === 'users' && users.length === 0) fetchTabData('users');
    if (tabName === 'banners' && banners.length === 0) fetchTabData('banners');
    if (tabName === 'branding' && !branding) fetchTabData('branding');
    // Close mobile menu on tab change
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  // Fetch tab data
  const fetchTabData = async (tab: string) => {
    setTabLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      switch (tab) {
        case 'products':
          const productsRes = await fetch('/api/products?adminView=true', { headers });
          if (productsRes.ok) {
            const data = await productsRes.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
          }
          break;
        case 'categories':
          const categoriesRes = await fetch('/api/categories/all', { headers });
          if (categoriesRes.ok) {
            const data = await categoriesRes.json();
            console.log('Categories fetched from DB:', {
              isArray: Array.isArray(data),
              count: Array.isArray(data) ? data.length : 0,
              data: data,
            });
            setCategories(Array.isArray(data) ? data : data.categories || []);
          } else {
            console.error('Categories fetch failed:', categoriesRes.status);
            // Fallback to regular categories endpoint
            const fallbackRes = await fetch('/api/categories', { headers });
            if (fallbackRes.ok) {
              const data = await fallbackRes.json();
              console.log('Categories fetched from fallback:', {
                isArray: Array.isArray(data),
                count: Array.isArray(data) ? data.length : 0,
                data: data,
              });
              setCategories(Array.isArray(data) ? data : data.categories || []);
            }
          }
          break;
        case 'orders':
          try {
            const ordersRes = await fetch('/api/orders', { headers });
            if (ordersRes.ok) {
              const data = await ordersRes.json();
              console.log('Orders fetched from DB:', {
                count: Array.isArray(data) ? data.length : 0,
                data: data,
              });
              const ordersList = Array.isArray(data) ? data : data.orders || [];
              setOrders(ordersList);
            } else {
              console.error('Orders fetch failed:', ordersRes.status);
              setOrders([]);
            }
          } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
          }
          break;
        case 'users':
          const usersRes = await fetch('/api/auth/users', { headers });
          if (usersRes.ok) {
            const data = await usersRes.json();
            setUsers(Array.isArray(data) ? data : data.users || []);
          }
          break;
        case 'banners':
          const bannersRes = await fetch('/api/banners', { headers });
          if (bannersRes.ok) {
            const data = await bannersRes.json();
            setBanners(Array.isArray(data) ? data : data.banners || []);
          }
          break;
        case 'branding':
          const brandingRes = await fetch('/api/branding', { headers });
          if (brandingRes.ok) {
            const data = await brandingRes.json();
            setBranding(data);
          }
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setTabLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const handleViewOrder = async (order: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${order._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const fullOrder = await response.json();
        console.log('Full order details:', fullOrder);
        console.log('Customer info:', fullOrder.customerInfo);
        setSelectedOrder(fullOrder);
        setOrderModalOpen(true);
      } else {
        console.error('Failed to fetch order details:', response.status);
        setSelectedOrder(order);
        setOrderModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrder(order);
      setOrderModalOpen(true);
    }
  };

  const handleRegenerateCustomerInfo = async () => {
    if (!selectedOrder || !selectedOrder.user) {
      alert('Cannot regenerate: No user associated with this order');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const generatedCustomerInfo = {
        firstName: selectedOrder.user?.name?.split(' ')[0] || '',
        lastName: selectedOrder.user?.name?.split(' ').slice(1).join(' ') || '',
        email: selectedOrder.user?.email || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
      };

      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerInfo: generatedCustomerInfo,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setSelectedOrder(updatedOrder);
        // Refresh orders list
        await refetchOrders();
        alert('Customer info regenerated from user account');
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error regenerating customer info:', error);
      alert('Error regenerating customer info');
    }
  };

  const refetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Orders refetched:', {
          count: Array.isArray(data) ? data.length : 0,
          orders: data,
        });
        const ordersList = Array.isArray(data) ? data : data.orders || [];
        setOrders(ordersList);
      } else {
        console.error('Failed to refetch orders:', response.status);
      }
    } catch (error) {
      console.error('Error refetching orders:', error);
    }
  };

  const handleUpdateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setSelectedOrder(updatedOrder);
        await refetchOrders();
        console.log('Order status updated to:', newStatus);
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    if (!confirm(`Are you sure you want to delete order #${selectedOrder._id?.toString().slice(-12)}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Order deleted successfully');
        setOrderModalOpen(false);
        setSelectedOrder(null);
        await refetchOrders();
      } else {
        const error = await response.json();
        alert(`Failed to delete order: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove user from list
        setUsers(users.filter(u => u._id !== userId));
        alert('User deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload response:', data); // Debug
        
        // Update branding with new logo URL
        const updatedBranding = { ...branding, logoUrl: data.url };
        setBranding(updatedBranding);
        
        // Auto-save branding with the new logo URL
        try {
          const saveResponse = await fetch('/api/branding', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedBranding),
          });

          if (saveResponse.ok) {
            const savedData = await saveResponse.json();
            console.log('Branding saved:', savedData); // Debug
            setBranding(savedData);
            alert('Logo uploaded and saved successfully!');
          } else {
            alert('Logo uploaded but saving failed. Click Save Changes to persist.');
          }
        } catch (saveError) {
          console.error('Error auto-saving branding:', saveError);
          alert('Logo uploaded but saving failed. Click Save Changes to persist.');
        }
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    }
  };

  const removeLogo = () => {
    if (confirm('Are you sure you want to remove the logo?')) {
      setBranding({ ...branding, logoUrl: '' });
    }
  };

  const handleSaveBranding = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(branding),
      });

      if (response.ok) {
        const data = await response.json();
        setBranding(data);
        alert('Branding settings saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save branding: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to save branding settings');
    }
  };

  const handleBrandingInputChange = (field: string, value: string) => {
    setBranding({ ...branding, [field]: value });
  };

  const handleBannerUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bannerForm.title.trim()) {
      alert('Banner title is required');
      return;
    }

    setBannerFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      let imageUrl = '';

      // Upload image if provided
      if (bannerImageFile) {
        const formData = new FormData();
        formData.append('file', bannerImageFile);
        formData.append('type', 'banner');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed with status ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Create or update banner
      const bannerData = {
        ...bannerForm,
        imageUrl: imageUrl || currentBannerImageUrl,
      };

      const method = editingBannerId ? 'PUT' : 'POST';
      const url = editingBannerId ? `/api/banners/${editingBannerId}` : '/api/banners';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bannerData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refetch banners to ensure consistency
        try {
          const token = localStorage.getItem('token');
          const refreshRes = await fetch('/api/banners', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (refreshRes.ok) {
            const refreshedData = await refreshRes.json();
            setBanners(Array.isArray(refreshedData) ? refreshedData : refreshedData.banners || []);
          }
        } catch (err) {
          console.warn('Failed to refetch banners, using local update:', err);
          // Fallback to local state update
          if (editingBannerId) {
            setBanners(banners.map(b => b._id === editingBannerId ? result : b));
          } else {
            setBanners([...banners, result]);
          }
        }

        // Reset form
        setBannerForm({
          title: '',
          description: '',
          location: 'hero',
          ctaText: '',
          ctaLink: '',
          isActive: true,
        });
        setCurrentBannerImageUrl('');
        setBannerImageFile(null);
        setEditingBannerId(null);
        setBannerModalOpen(false);
        alert(editingBannerId ? 'Banner updated successfully! It will appear on the frontend within 10 seconds.' : 'Banner created successfully! It will appear on the frontend within 10 seconds.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `Error: ${response.statusText}`;
        alert(`Failed to save banner: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Error saving banner:', error);
      alert(`Failed to save banner: ${error.message}`);
    } finally {
      setBannerFormLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string, bannerTitle: string) => {
    if (!confirm(`Are you sure you want to delete banner "${bannerTitle}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove banner from list
        setBanners(banners.filter(b => b._id !== bannerId));
        alert('Banner deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete banner: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleEditBanner = (banner: any) => {
    setBannerForm({
      title: banner.title,
      description: banner.description || '',
      location: banner.location || 'hero',
      ctaText: banner.ctaText || '',
      ctaLink: banner.ctaLink || '',
      isActive: banner.isActive !== false,
    });
    setCurrentBannerImageUrl(banner.imageUrl || '');
    setEditingBannerId(banner._id);
    setBannerModalOpen(true);
  };

  const handleOpenBannerModal = () => {
    setBannerForm({
      title: '',
      description: '',
      location: 'hero',
      ctaText: '',
      ctaLink: '',
      isActive: true,
    });
    setCurrentBannerImageUrl('');
    setBannerImageFile(null);
    setEditingBannerId(null);
    setBannerModalOpen(true);
  };

  const handleCloseBannerModal = () => {
    setBannerModalOpen(false);
    setBannerForm({
      title: '',
      description: '',
      location: 'hero',
      ctaText: '',
      ctaLink: '',
      isActive: true,
    });
    setCurrentBannerImageUrl('');
    setBannerImageFile(null);
    setEditingBannerId(null);
  };

  // Product handlers
  const handleOpenProductModal = () => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      featured: false,
      discount: 0,
    });
    setProductImageFile(null);
    setEditingProductId(null);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductModalOpen(false);
    setProductForm({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      featured: false,
      discount: 0,
    });
    setProductImageFile(null);
    setEditingProductId(null);
  };

  const handleEditProduct = (product: any) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      stock: product.stock || 0,
      featured: product.featured || false,
      discount: product.discount || 0,
    });
    setCurrentProductImageUrl(product.imageUrl || '');
    setEditingProductId(product._id);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete product "${productName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        alert('Product deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete product: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  // Category handlers
  const handleOpenCategoryModal = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      parent: '',
    });
    setCategoryImageFile(null);
    setEditingCategoryId(null);
    setCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      parent: '',
    });
    setCategoryImageFile(null);
    setEditingCategoryId(null);
  };

  const handleEditCategory = (category: any) => {
    setCategoryForm({
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      parent: category.parent?._id || '',
    });
    setCurrentCategoryImageUrl(category.imageUrl || '');
    setEditingCategoryId(category._id);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCategories(categories.filter(c => c._id !== categoryId));
        alert('Category deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete category: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (productForm.price <= 0) {
      alert('Product price must be greater than 0');
      return;
    }

    if (productForm.discount < 0 || productForm.discount > 100) {
      alert('Discount must be between 0 and 100');
      return;
    }

    setProductFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      let imageUrl = '';

      // Upload image if provided
      if (productImageFile) {
        const formData = new FormData();
        formData.append('file', productImageFile);
        formData.append('type', 'product');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed with status ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Create or update product
      const productData = {
        ...productForm,
        imageUrl: imageUrl || currentProductImageUrl,
      };

      console.log('Sending product data:', productData);

      const method = editingProductId ? 'PUT' : 'POST';
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product saved successfully:', result);
        
        // Refetch products to ensure frontend stays in sync
        try {
          const token = localStorage.getItem('token');
          const refreshRes = await fetch('/api/products?adminView=true', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (refreshRes.ok) {
            const refreshedData = await refreshRes.json();
            setProducts(Array.isArray(refreshedData) ? refreshedData : refreshedData.products || []);
          }
        } catch (err) {
          console.warn('Failed to refetch products, using local update:', err);
          // Fallback to local state update
          if (editingProductId) {
            setProducts(products.map(p => p._id === editingProductId ? result : p));
          } else {
            setProducts([...products, result]);
          }
        }

        // Reset form
        setProductForm({
          name: '',
          description: '',
          price: 0,
          category: '',
          stock: 0,
          featured: false,
          discount: 0,
        });
        setCurrentProductImageUrl('');
        setProductImageFile(null);
        setEditingProductId(null);
        setProductModalOpen(false);
        alert(editingProductId ? 'Product updated successfully! It will appear on the frontend within 10 seconds.' : 'Product created successfully! It will appear on the frontend within 10 seconds.');
      } else {
        const error = await response.json();
        alert(`Failed to save product: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      alert('Category name is required');
      return;
    }

    setCategoryFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      let imageUrl = '';

      // Upload image if provided
      if (categoryImageFile) {
        const formData = new FormData();
        formData.append('file', categoryImageFile);
        formData.append('type', 'category');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed with status ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Create or update category
      const categoryData = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description,
        parent: categoryForm.parent || null,
        imageUrl: imageUrl || currentCategoryImageUrl,
      };

      const method = editingCategoryId ? 'PUT' : 'POST';
      const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refetch categories to ensure consistency
        try {
          const token = localStorage.getItem('token');
          const refreshRes = await fetch('/api/categories/all', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (refreshRes.ok) {
            const refreshedData = await refreshRes.json();
            setCategories(Array.isArray(refreshedData) ? refreshedData : refreshedData.categories || []);
          }
        } catch (err) {
          console.warn('Failed to refetch categories, using local update:', err);
          // Fallback to local state update
          if (editingCategoryId) {
            setCategories(categories.map(c => c._id === editingCategoryId ? result : c));
          } else {
            setCategories([...categories, result]);
          }
        }

        // Reset form
        setCategoryForm({
          name: '',
          slug: '',
          description: '',
          parent: '',
        });
        setCurrentCategoryImageUrl('');
        setCategoryImageFile(null);
        setEditingCategoryId(null);
        setCategoryModalOpen(false);
        alert(editingCategoryId ? 'Category updated successfully!' : 'Category created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save category: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    } finally {
      setCategoryFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}>Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <h2 className={styles.title}>Access Denied</h2>
          <p>You must be an administrator to access this page.</p>
          <Link href="/" className={styles.link}>Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div>
            <h2 className={styles.sidebarTitle}>Admin Panel</h2>
            <p className={styles.adminName}>Welcome, {user.name}</p>
          </div>
          <button 
            className={styles.sidebarToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className={`${styles.sidebarNav} ${mobileMenuOpen ? styles.active : ''}`}>
          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Main</p>
            <button
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <span className={styles.navIcon}>📊</span>
              <span>Dashboard</span>
            </button>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Content Management</p>
            <button
              className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
              onClick={() => handleTabChange('products')}
            >
              <span className={styles.navIcon}>📦</span>
              <span>Products</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'categories' ? styles.active : ''}`}
              onClick={() => handleTabChange('categories')}
            >
              <span className={styles.navIcon}>🏷️</span>
              <span>Categories</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'banners' ? styles.active : ''}`}
              onClick={() => handleTabChange('banners')}
            >
              <span className={styles.navIcon}>🖼️</span>
              <span>Banners</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'homeSettings' ? styles.active : ''}`}
              onClick={() => handleTabChange('homeSettings')}
            >
              <span className={styles.navIcon}>🏠</span>
              <span>Homepage Settings</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'featuredProducts' ? styles.active : ''}`}
              onClick={() => handleTabChange('featuredProducts')}
            >
              <span className={styles.navIcon}>⭐</span>
              <span>Featured Products</span>
            </button>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Business</p>
            <button
              className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <span className={styles.navIcon}>📋</span>
              <span>Orders</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
              onClick={() => handleTabChange('users')}
            >
              <span className={styles.navIcon}>👥</span>
              <span>Users</span>
            </button>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Settings</p>
            <button
              className={`${styles.navItem} ${activeTab === 'branding' ? styles.active : ''}`}
              onClick={() => handleTabChange('branding')}
            >
              <span className={styles.navIcon}>🎨</span>
              <span>Branding</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => handleTabChange('analytics')}
            >
              <span className={styles.navIcon}>📈</span>
              <span>Analytics</span>
            </button>
          </div>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.content}>
        {activeTab === 'dashboard' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Dashboard</h1>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Products</h3>
                <p className={styles.statValue}>{stats?.totalProducts || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Orders</h3>
                <p className={styles.statValue}>{stats?.totalOrders || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Users</h3>
                <p className={styles.statValue}>{stats?.totalUsers || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Revenue</h3>
                <p className={styles.statValue}>${stats?.totalRevenue || 0}</p>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.buttonGrid}>
                <button className={styles.actionBtn} onClick={() => setActiveTab('products')}>
                  Add New Product
                </button>
                <button className={styles.actionBtn} onClick={() => setActiveTab('categories')}>
                  Manage Categories
                </button>
                <button className={styles.actionBtn} onClick={() => setActiveTab('banners')}>
                  Update Banners
                </button>
                <button className={styles.actionBtn} onClick={() => setActiveTab('orders')}>
                  View Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Products Management</h1>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Products ({products.length})</h2>
                <button className={styles.actionBtn} onClick={handleOpenProductModal}>+ Add New Product</button>
              </div>
              {tabLoading ? (
                <p>Loading products...</p>
              ) : products.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product: any) => (
                      <tr key={product._id}>
                        <td className={styles.productName}>{product.name}</td>
                        <td>{product.category}</td>
                        <td>${product.price}</td>
                        <td>{product.stock || 0}</td>
                        <td>
                          <button className={styles.editBtn} onClick={() => handleEditProduct(product)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteProduct(product._id, product.name)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.emptyState}>No products found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Categories Management</h1>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Categories ({categories.length})</h2>
                <button className={styles.actionBtn} onClick={handleOpenCategoryModal}>+ Add New Category</button>
              </div>
              {tabLoading ? (
                <p>Loading categories...</p>
              ) : categories.length > 0 ? (
                <div className={styles.categoriesGrid}>
                  {categories.map((category: any) => (
                    <div key={category._id} className={styles.categoryCard}>
                      <div className={styles.categoryImage}>
                        {category.image ? (
                          <img src={category.image} alt={category.name} />
                        ) : (
                          <div className={styles.imagePlaceholder}>📁</div>
                        )}
                      </div>
                      <h3>{category.name}</h3>
                      {category.parent && (
                        <p className={styles.categoryParent}>
                          Parent: <strong>{category.parent.name || 'Unknown'}</strong>
                        </p>
                      )}
                      <p className={styles.categoryCount}>{category.products || 0} products</p>
                      <div className={styles.cardActions}>
                        <button className={styles.editBtn} onClick={() => handleEditCategory(category)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteCategory(category._id, category.name)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No categories found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Banners Management</h1>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Banners ({banners.length})</h2>
                <button className={styles.actionBtn} onClick={handleOpenBannerModal}>+ Upload New Banner</button>
              </div>
              {tabLoading ? (
                <p>Loading banners...</p>
              ) : banners.length > 0 ? (
                <div className={styles.bannersGrid}>
                  {banners.map((banner: any, idx: number) => (
                    <div key={banner._id || idx} className={styles.bannerCard}>
                      <div className={styles.bannerImage}>
                        {banner.imageUrl ? (
                          <img src={banner.imageUrl} alt={banner.title || `Banner ${idx}`} />
                        ) : (
                          <div className={styles.imagePlaceholder}>🖼️</div>
                        )}
                      </div>
                      <h3>{banner.title || `Banner ${idx + 1}`}</h3>
                      <p className={styles.bannerLocation}>{banner.location || 'Featured'}</p>
                      <div className={styles.cardActions}>
                        <button className={styles.editBtn} onClick={() => handleEditBanner(banner)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteBanner(banner._id, banner.title)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No banners found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Orders Management</h1>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Recent Orders ({orders.length})</h2>
              {tabLoading ? (
                <p>Loading orders...</p>
              ) : orders.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order: any) => (
                      <tr key={order._id}>
                        <td>{order._id?.toString().slice(-8)}</td>
                        <td>
                          {order.customerInfo?.firstName && order.customerInfo?.lastName
                            ? `${order.customerInfo.firstName} ${order.customerInfo.lastName}`
                            : order.user?.name || 'Unknown'}
                        </td>
                        <td>${order.totalAmount?.toFixed(2)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[order.status?.toLowerCase()]}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className={styles.viewBtn} onClick={() => handleViewOrder(order)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.emptyState}>No orders found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Users Management</h1>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>All Users ({users.length})</h2>
              {tabLoading ? (
                <p>Loading users...</p>
              ) : users.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((u: any) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[u.role?.toLowerCase()]}`}>
                            {u.role || 'User'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className={styles.viewBtn}>View</button>
                          {u.role !== 'admin' && (
                            <button 
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteUser(u._id, u.name)}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.emptyState}>No users found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Site Branding</h1>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Customize Your Store</h2>
              {branding ? (
                <div className={styles.brandingForm}>
                  <div className={styles.formGroup}>
                    <label>Store Name</label>
                    <input 
                      type="text" 
                      value={branding.storeName || 'Nova Store'}
                      onChange={(e) => handleBrandingInputChange('storeName', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Primary Color</label>
                    <input 
                      type="color" 
                      value={branding.primaryColor || '#2a317f'}
                      onChange={(e) => handleBrandingInputChange('primaryColor', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Accent Color</label>
                    <input 
                      type="color" 
                      value={branding.accentColor || '#df172e'}
                      onChange={(e) => handleBrandingInputChange('accentColor', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Logo Upload</label>
                    <div className={styles.fileInputWrapper}>
                      <input 
                        type="file" 
                        id="logoInput"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={(e) => handleLogoUpload(e)}
                      />
                      <label htmlFor="logoInput" className={styles.fileInputLabel}>
                        Click to upload or drag and drop
                      </label>
                      {branding?.logoUrl && (
                        <div className={styles.logoPreview}>
                          <img src={branding.logoUrl} alt="Logo Preview" />
                          <button 
                            type="button"
                            className={styles.removeLogo}
                            onClick={() => removeLogo()}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    className={styles.actionBtn}
                    onClick={handleSaveBranding}
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <p className={styles.emptyState}>Branding settings not available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Analytics & Reports</h1>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Store Performance</h2>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticCard}>
                  <h3>Total Sales</h3>
                  <p className={styles.analyticValue}>${stats?.totalRevenue || 0}</p>
                  <p className={styles.analyticSubtext}>All time</p>
                </div>
                <div className={styles.analyticCard}>
                  <h3>Conversion Rate</h3>
                  <p className={styles.analyticValue}>3.2%</p>
                  <p className={styles.analyticSubtext}>Last 30 days</p>
                </div>
                <div className={styles.analyticCard}>
                  <h3>Avg Order Value</h3>
                  <p className={styles.analyticValue}>${stats?.totalRevenue && stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}</p>
                  <p className={styles.analyticSubtext}>Per order</p>
                </div>
                <div className={styles.analyticCard}>
                  <h3>Customer Satisfaction</h3>
                  <p className={styles.analyticValue}>4.8/5</p>
                  <p className={styles.analyticSubtext}>Based on reviews</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'homeSettings' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Homepage Settings</h1>
            <AdminHomeSettings />
          </div>
        )}

        {activeTab === 'featuredProducts' && (
          <div className={styles.tabContent}>
            <h1 className={styles.contentTitle}>Featured Products</h1>
            <AdminProductFeaturing />
          </div>
        )}

      {/* Product Modal */}
      {productModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseProductModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseProductModal}>✕</button>
            </div>
            <form className={styles.form} onSubmit={handleProductSave}>
              <div className={styles.formGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Stock</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                  placeholder="Enter stock quantity"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={productForm.discount}
                  onChange={(e) => setProductForm({ ...productForm, discount: parseInt(e.target.value) || 0 })}
                  placeholder="Enter discount percentage (0-100)"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  />
                  Featured Product
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitBtn} disabled={productFormLoading}>
                  {productFormLoading ? 'Saving...' : (editingProductId ? 'Update Product' : 'Add Product')}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseProductModal} disabled={productFormLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseCategoryModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseCategoryModal}>✕</button>
            </div>
            <form className={styles.form} onSubmit={handleCategorySave}>
              <div className={styles.formGroup}>
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="Enter URL slug"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Parent Category</label>
                <select
                  value={categoryForm.parent}
                  onChange={(e) => setCategoryForm({ ...categoryForm, parent: e.target.value })}
                >
                  <option value="">None (Top-level category)</option>
                  {categories
                    .filter((c: any) => c._id !== editingCategoryId)
                    .map((c: any) => (
                      <option key={c._id} value={c._id}>
                        {c.parent ? `${c.parent.name} > ${c.name}` : c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitBtn} disabled={categoryFormLoading}>
                  {categoryFormLoading ? 'Saving...' : (editingCategoryId ? 'Update Category' : 'Add Category')}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseCategoryModal} disabled={categoryFormLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {bannerModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseBannerModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingBannerId ? 'Edit Banner' : 'Create New Banner'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseBannerModal}>✕</button>
            </div>
            <form onSubmit={handleBannerUpload} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Banner Title *</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Location</label>
                <select
                  value={bannerForm.location}
                  onChange={(e) => setBannerForm({ ...bannerForm, location: e.target.value })}
                >
                  <option value="hero">Hero Banner</option>
                  <option value="featured">Featured Section</option>
                  <option value="promo1">Promo 1</option>
                  <option value="promo2">Promo 2</option>
                  <option value="bottom">Bottom Banner</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerImageFile(e.target.files?.[0] || null)}
                />
                {currentBannerImageUrl && (
                  <p className={styles.imageInfo}>Current: {currentBannerImageUrl}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>CTA Text</label>
                <input
                  type="text"
                  value={bannerForm.ctaText}
                  onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                  placeholder="Button text (e.g., 'Shop Now')"
                />
              </div>

              <div className={styles.formGroup}>
                <label>CTA Link</label>
                <input
                  type="text"
                  value={bannerForm.ctaLink}
                  onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                  placeholder="Link or path (e.g., '/products')"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={bannerForm.isActive}
                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  />
                  Active Banner
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={bannerFormLoading}
                >
                  {bannerFormLoading ? 'Saving...' : (editingBannerId ? 'Update Banner' : 'Create Banner')}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseBannerModal}
                  disabled={bannerFormLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderModalOpen && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setOrderModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order #({selectedOrder._id?.toString().slice(-12)})</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDeleteOrder}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  title="Delete order"
                >
                  🗑️ Delete
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={() => setOrderModalOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              {/* Order Information Section */}
              <div className={styles.orderDetailSection}>
                <h3>Order Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p><strong>Status:</strong></p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        backgroundColor: selectedOrder.status === 'pending' ? '#fef3c7' : selectedOrder.status === 'processing' ? '#dbeafe' : selectedOrder.status === 'shipped' ? '#d1fae5' : '#f3e8ff',
                        color: selectedOrder.status === 'pending' ? '#92400e' : selectedOrder.status === 'processing' ? '#1e40af' : selectedOrder.status === 'shipped' ? '#065f46' : '#581c87',
                        fontWeight: '500',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>Payment: {selectedOrder.paymentMethod || 'COD'}</p>
                  </div>
                  <div>
                    <p><strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Last Updated: {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Total:</strong> <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937' }}>${(selectedOrder.totalAmount || 0).toFixed(2)}</span></p>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className={styles.orderDetailSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Customer Information</h3>
                  {!selectedOrder.customerInfo?.firstName && selectedOrder.user && (
                    <button
                      onClick={handleRegenerateCustomerInfo}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Generate from Account
                    </button>
                  )}
                </div>

                {selectedOrder.customerInfo?.firstName || selectedOrder.customerInfo?.email ? (
                  <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <p><strong>Name:</strong> {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                        <p><strong>Email:</strong> {selectedOrder.customerInfo.email}</p>
                        <p><strong>Phone:</strong> {selectedOrder.customerInfo.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong> {selectedOrder.customerInfo.address || 'N/A'}</p>
                        <p><strong>City:</strong> {selectedOrder.customerInfo.city || 'N/A'}</p>
                        <p><strong>Postal Code:</strong> {selectedOrder.customerInfo.postalCode || 'N/A'}</p>
                        <p><strong>Country:</strong> {selectedOrder.customerInfo.country || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : selectedOrder.user ? (
                  <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                    <p style={{ color: '#92400e', marginBottom: '0.5rem' }}>
                      <strong>⚠️ No checkout information found</strong>
                    </p>
                    <p><strong>User Account:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                    <p style={{ color: '#991b1b' }}>❌ No customer information available</p>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div className={styles.orderDetailSection}>
                <h3>Order Items ({(selectedOrder.products || []).length})</h3>
                {(selectedOrder.products || []).length > 0 ? (
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.products || []).map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td>{item.product?.name || item.productId || 'Unknown Product'}</td>
                          <td style={{ textAlign: 'center' }}>{item.quantity || 0}</td>
                          <td style={{ textAlign: 'right' }}>${(item.price || 0).toFixed(2)}</td>
                          <td style={{ textAlign: 'right', fontWeight: '600' }}>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#999', textAlign: 'center' }}>No items in this order</p>
                )}
              </div>

              {/* Debug Section */}
              <details style={{ marginTop: '1.5rem', color: '#666', fontSize: '0.85rem' }}>
                <summary style={{ cursor: 'pointer', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                  📋 Raw Order Data
                </summary>
                <pre style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '4px', overflow: 'auto', fontSize: '0.75rem', marginTop: '0.5rem', maxHeight: '300px' }}>
                  {JSON.stringify(selectedOrder, null, 2)}
                </pre>
              </details>

              {/* Close Button */}

              <button
                className={styles.submitBtn}
                onClick={() => setOrderModalOpen(false)}
                style={{ marginTop: '1.5rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
