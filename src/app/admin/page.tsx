
"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, query, orderBy } from "firebase/firestore";
import { Product, Category, Order, UserProfile, StoreSettings, Driver, Pairing } from "@/lib/types";
import { 
  Plus, Trash2, Save, X, Settings, Package, 
  Copy, LayoutDashboard, ShoppingCart, Users, Loader2,
  TrendingUp, Clock, AlertCircle, ShieldAlert, Bike, Phone, ImageIcon, Wine, Sparkles, Moon, Share2, Instagram, Facebook, MessageCircle, Type, Download, Calendar, Star, Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: "",
    brand: "",
    description: "",
    price: 0,
    category: "Spirits",
    imageUrl: "",
    rating: 5,
    isAgeRestricted: true,
    stockStatus: 'in-stock',
    stockQuantity: 0
  });

  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [driverFormData, setDriverFormData] = useState<Partial<Driver>>({
    firstName: "",
    lastName: "",
    contactNumber: "",
    status: 'available'
  });

  const [isAddingPairing, setIsAddingPairing] = useState(false);
  const [editingPairingId, setEditingPairingId] = useState<string | null>(null);
  const [pairingFormData, setPairingFormData] = useState<Partial<Pairing>>({
    name: "",
    description: "",
    liquorProductId: "",
    snackProductId: "",
    imageUrl: ""
  });

  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'admin_roles', user.uid);
  }, [firestore, user]);
  
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const isAdminConfirmed = !!adminRole || user?.uid === "Q3AAJKZAPvZYvcTEkLatjWP1ftD2";
  const isStatusChecking = isUserLoading || isAdminRoleLoading;

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || isStatusChecking || !isAdminConfirmed) return null;
    return query(collection(firestore, "products"), orderBy("name"));
  }, [firestore, isStatusChecking, isAdminConfirmed]);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || isStatusChecking || !isAdminConfirmed) return null;
    return query(collection(firestore, "orders"), orderBy("orderDate", "desc"));
  }, [firestore, isStatusChecking, isAdminConfirmed]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || isStatusChecking || !isAdminConfirmed) return null;
    return collection(firestore, "users");
  }, [firestore, isStatusChecking, isAdminConfirmed]);

  const driversQuery = useMemoFirebase(() => {
    if (!firestore || isStatusChecking || !isAdminConfirmed) return null;
    return collection(firestore, "drivers");
  }, [firestore, isStatusChecking, isAdminConfirmed]);

  const pairingsQuery = useMemoFirebase(() => {
    if (!firestore || isStatusChecking || !isAdminConfirmed) return null;
    return collection(firestore, "pairings");
  }, [firestore, isStatusChecking, isAdminConfirmed]);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || isStatusChecking || !isAdminConfirmed) return null;
    return doc(firestore, "settings", "store_config");
  }, [firestore, isStatusChecking, isAdminConfirmed]);

  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);
  const { data: orders } = useCollection<Order>(ordersQuery);
  const { data: users } = useCollection<UserProfile>(usersQuery);
  const { data: drivers } = useCollection<Driver>(driversQuery);
  const { data: pairings, isLoading: isPairingsLoading } = useCollection<Pairing>(pairingsQuery);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  const liquorProducts = products?.filter(p => ['Spirits', 'Wine', 'Beer'].includes(p.category)) || [];
  const snackProducts = products?.filter(p => p.category === 'Snacks') || [];

  const totalSales = orders?.reduce((sum, order) => {
    const isPaid = order.paymentStatus === 'paid';
    const isNotCancelled = order.status !== 'cancelled';
    return sum + (isPaid && isNotCancelled ? order.totalAmount : 0);
  }, 0) || 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const dailySales = orders?.reduce((sum, order) => {
    const isToday = order.orderDate.startsWith(todayStr);
    const isPaid = order.paymentStatus === 'paid';
    const isNotCancelled = order.status !== 'cancelled';
    return sum + (isToday && isPaid && isNotCancelled ? order.totalAmount : 0);
  }, 0) || 0;

  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const activeUsers = users?.length || 0;
  const activeDrivers = drivers?.filter(d => d.status !== 'offline').length || 0;

  const downloadSalesReport = () => {
    if (!orders || orders.length === 0) {
      toast({ title: "No Data", description: "No orders found to generate report.", variant: "destructive" });
      return;
    }
    
    const doc = new jsPDF();
    const storeName = storeSettings?.storeName || "RAKSHIMANDU";
    const reportDate = new Date().toLocaleDateString();
    
    doc.setFontSize(22);
    doc.setTextColor(180, 0, 0); 
    doc.text(storeName.toUpperCase(), 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("SALES & FULFILLMENT REPORT", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${reportDate} | System Session: ${user?.uid.slice(0, 8)}...`, 14, 38);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL SALES: NRS ${totalSales.toLocaleString()}`, 14, 52);
    doc.text(`DAILY SALES (${reportDate}): NRS ${dailySales.toLocaleString()}`, 14, 60);
    doc.text(`TOTAL ORDERS: ${orders.length}`, 14, 68);

    const tableData = orders.map(order => [
      order.id.slice(-8).toUpperCase(),
      order.customerName,
      `NRS ${order.totalAmount.toLocaleString()}`,
      order.status.toUpperCase(),
      new Date(order.orderDate).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['ORDER ID', 'CUSTOMER', 'AMOUNT', 'STATUS', 'DATE']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    
    doc.save(`${storeName.toLowerCase()}_sales_report_${todayStr}.pdf`);
    toast({ title: "Report Downloaded", description: "The PDF sales report has been generated." });
  };

  const handleSaveProduct = () => {
    if (!productFormData.name || !productFormData.imageUrl) {
      toast({ title: "Validation Error", description: "Name and Image URL are required.", variant: "destructive" });
      return;
    }

    if (editingProductId) {
      const docRef = doc(firestore, "products", editingProductId);
      updateDocumentNonBlocking(docRef, productFormData);
      toast({ title: "Item Updated" });
    } else {
      const colRef = collection(firestore, "products");
      addDocumentNonBlocking(colRef, { ...productFormData, id: Date.now().toString() });
      toast({ title: "Item Added" });
    }
    resetProductForm();
  };

  const handleSaveDriver = () => {
    if (!driverFormData.firstName || !driverFormData.contactNumber) {
      toast({ title: "Validation Error", description: "First Name and Contact Number are required.", variant: "destructive" });
      return;
    }

    if (editingDriverId) {
      const docRef = doc(firestore, "drivers", editingDriverId);
      updateDocumentNonBlocking(docRef, driverFormData);
      toast({ title: "Rider Updated" });
    } else {
      const colRef = collection(firestore, "drivers");
      addDocumentNonBlocking(colRef, { ...driverFormData, id: Date.now().toString() });
      toast({ title: "Rider Added" });
    }
    resetDriverForm();
  };

  const handleSavePairing = () => {
    if (!pairingFormData.name || !pairingFormData.liquorProductId || !pairingFormData.snackProductId) {
      toast({ title: "Validation Error", description: "Name, Liquor and Snack selections are required.", variant: "destructive" });
      return;
    }

    if (editingPairingId) {
      const docRef = doc(firestore, "pairings", editingPairingId);
      updateDocumentNonBlocking(docRef, pairingFormData);
      toast({ title: "Combo Updated" });
    } else {
      const colRef = collection(firestore, "pairings");
      addDocumentNonBlocking(colRef, { ...pairingFormData, id: Date.now().toString() });
      toast({ title: "Combo Added" });
    }
    resetPairingForm();
  };

  const resetProductForm = () => {
    setProductFormData({ name: "", brand: "", description: "", price: 0, category: "Spirits", imageUrl: "", rating: 5, isAgeRestricted: true, stockStatus: 'in-stock', stockQuantity: 0 });
    setEditingProductId(null);
    setIsAddingProduct(false);
  };

  const resetDriverForm = () => {
    setDriverFormData({ firstName: "", lastName: "", contactNumber: "", status: 'available' });
    setEditingDriverId(null);
    setIsAddingDriver(false);
  };

  const resetPairingForm = () => {
    setPairingFormData({ name: "", description: "", liquorProductId: "", snackProductId: "", imageUrl: "" });
    setEditingPairingId(null);
    setIsAddingPairing(false);
  };

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = (field: keyof StoreSettings, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // Keep under 800KB for Firestore doc limit
      toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 800KB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setDocumentNonBlocking(settingsRef!, { [field]: base64String }, { merge: true });
      toast({ title: "Image Uploaded", description: "Settings updated successfully." });
    };
    reader.readAsDataURL(file);
  };

  const handleFormImageUpload = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    currentData: any,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 800KB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setter({ ...currentData, imageUrl: base64String });
      toast({ title: "Image Uploaded", description: "Preview updated." });
    };
    reader.readAsDataURL(file);
  };

  if (isStatusChecking) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="font-headline text-2xl uppercase tracking-widest text-accent animate-pulse">Authenticating Admin...</p>
      </main>
    );
  }
  
  if (!user || !isAdminConfirmed) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-background">
      <h1 className="text-4xl md:text-6xl font-headline text-red-500 text-center px-4">ACCESS DENIED</h1>
      <p className="text-muted-foreground text-center">You do not have administrative privileges.</p>
      <Button onClick={() => window.location.href = '/account'} className="rounded-full px-8">RETURN TO PROFILE</Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-8xl font-headline tracking-tighter uppercase leading-[0.85]">{storeSettings?.storeName || "RAKSHIMANDU"} <br className="hidden md:block"/><span className="text-accent">DASHBOARD</span></h1>
            <p className="text-xs md:text-sm text-muted-foreground font-bold tracking-[0.3em] opacity-60 uppercase">System Administration Protocol</p>
          </div>
          <div className="bg-card/50 border border-white/10 p-5 rounded-2xl flex items-center gap-6 w-full md:w-auto overflow-hidden shadow-xl backdrop-blur-md">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1.5">Authorized Session UID</p>
              <code className="text-[10px] md:text-xs text-accent font-mono break-all bg-black/30 px-2 py-1 rounded">{user.uid}</code>
            </div>
            <Button size="icon" variant="outline" className="flex-shrink-0 rounded-full border-white/10" onClick={() => { navigator.clipboard.writeText(user.uid); toast({title: "UID Copied"}); }}><Copy className="w-4 h-4" /></Button>
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-10">
          <TabsList className="bg-card border border-white/5 h-auto p-1.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 shadow-2xl rounded-2xl overflow-x-auto scrollbar-hide">
            <TabsTrigger value="overview" className="text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 whitespace-nowrap"><LayoutDashboard className="w-3 h-3 md:w-4 md:h-4 mr-2" /> OVERVIEW</TabsTrigger>
            <TabsTrigger value="products" className="text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 whitespace-nowrap"><Package className="w-3 h-3 md:w-4 md:h-4 mr-2" /> PRODUCTS</TabsTrigger>
            <TabsTrigger value="combos" className="text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 whitespace-nowrap"><Wine className="w-3 h-3 md:w-4 md:h-4 mr-2" /> COMBOS</TabsTrigger>
            <TabsTrigger value="orders" className="text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 whitespace-nowrap"><ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" /> ORDERS</TabsTrigger>
            <TabsTrigger value="riders" className="text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 whitespace-nowrap"><Bike className="w-3 h-3 md:w-4 md:h-4 mr-2" /> RIDERS</TabsTrigger>
            <TabsTrigger value="users" className="text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 whitespace-nowrap"><Users className="w-3 h-3 md:w-4 md:h-4 mr-2" /> USERS</TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 whitespace-nowrap"><Settings className="w-3 h-3 md:w-4 md:h-4 mr-2" /> SETTINGS</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-4xl font-headline tracking-widest uppercase">FINANCIAL OVERVIEW</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-60">Real-time Performance Metrics</p>
              </div>
              <Button 
                onClick={downloadSalesReport} 
                className="bg-white text-black hover:bg-accent hover:text-white font-bold rounded-full px-8 h-12 shadow-xl transition-all"
              >
                <Download className="mr-2 w-4 h-4" /> DOWNLOAD SALES PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
               <Card className="bg-card/50 border-white/5 p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Growth</span>
                </div>
                <p className="text-[10px] font-bold uppercase opacity-60">Total Revenue</p>
                <h3 className="text-3xl font-headline">NRS {totalSales.toLocaleString()}</h3>
              </Card>
              <Card className="bg-card/50 border-white/5 p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Today</span>
                </div>
                <p className="text-[10px] font-bold uppercase opacity-60">Daily Sales</p>
                <h3 className="text-3xl font-headline">NRS {dailySales.toLocaleString()}</h3>
              </Card>
              <Card className="bg-card/50 border-white/5 p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Queued</span>
                </div>
                <p className="text-[10px] font-bold uppercase opacity-60">Pending Orders</p>
                <h3 className="text-3xl font-headline">{pendingOrders}</h3>
              </Card>
              <Card className="bg-card/50 border-white/5 p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active</span>
                </div>
                <p className="text-[10px] font-bold uppercase opacity-60">Registered Users</p>
                <h3 className="text-3xl font-headline">{activeUsers}</h3>
              </Card>
               <Card className="bg-card/50 border-white/5 p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <Bike className="w-5 h-5 text-accent" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Fleet</span>
                </div>
                <p className="text-[10px] font-bold uppercase opacity-60">Active Riders</p>
                <h3 className="text-3xl font-headline">{activeDrivers}</h3>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-headline tracking-widest uppercase">CATALOG MANAGER</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-60">Inventory & Pricing Control</p>
              </div>
              <Button onClick={() => setIsAddingProduct(true)} className="w-full sm:w-auto bg-accent text-accent-foreground font-bold rounded-full px-10 h-14 shadow-xl hover:scale-105 transition-transform"><Plus className="mr-2 h-5 w-5" /> ADD ITEM</Button>
            </div>

            {isAddingProduct && (
              <Card className="bg-card border-accent/30 overflow-hidden mb-12 shadow-3xl animate-in zoom-in-95 duration-300">
                <CardHeader className="bg-accent/5 py-8">
                  <CardTitle className="font-headline text-3xl md:text-4xl text-accent">{editingProductId ? "EDIT ITEM" : "ADD NEW ITEM"}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Product Name</label>
                      <Input value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" placeholder="e.g. Black Label 1L" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Price (NRS)</label>
                      <Input type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" placeholder="0.00" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Stock Quantity</label>
                      <Input type="number" value={productFormData.stockQuantity} onChange={e => setProductFormData({...productFormData, stockQuantity: Number(e.target.value)})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" placeholder="0" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Brand</label>
                      <Input value={productFormData.brand} onChange={e => setProductFormData({...productFormData, brand: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" placeholder="e.g. Johnnie Walker" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Category</label>
                      <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value as Category})} className="w-full h-12 bg-background border border-white/10 rounded-xl px-4 text-sm focus:ring-accent">
                        {['Spirits', 'Wine', 'Beer', 'Snacks', 'Bundles', 'Vapes'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Image URL</label>
                      <div className="flex gap-2">
                        <Input 
                          value={productFormData.imageUrl} 
                          onChange={e => setProductFormData({...productFormData, imageUrl: e.target.value})} 
                          className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent flex-1" 
                          placeholder="https://..." 
                        />
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current['product_image'] = el }}
                          onChange={(e) => handleFormImageUpload(setProductFormData, productFormData, e)}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-12 w-12 rounded-xl border-white/10 hover:bg-accent hover:text-accent-foreground"
                          onClick={() => fileInputRefs.current['product_image']?.click()}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-full space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Description</label>
                      <Textarea value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} className="bg-background border-white/10 rounded-xl min-h-[120px] focus:ring-accent" placeholder="Tell the story of this spirit..." />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button onClick={handleSaveProduct} className="flex-1 bg-accent text-accent-foreground font-bold h-14 rounded-2xl text-base shadow-xl"><Save className="mr-2 h-5 w-5" /> PERSIST TO DATABASE</Button>
                    <Button onClick={resetProductForm} variant="outline" className="px-12 h-14 rounded-2xl font-bold border-white/10 hover:bg-white/5"><X className="mr-2 h-5 w-5" /> ABORT CHANGES</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
              {isProductsLoading ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-card/20 animate-pulse rounded-2xl" />
                ))
              ) : products?.map(product => (
                <Card key={product.id} className="bg-card border-white/5 overflow-hidden group hover:border-accent/30 transition-all shadow-xl">
                  <div className="aspect-[4/5] relative">
                    <img src={product.imageUrl} className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" alt={product.name} />
                    <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                      <span className="text-xs font-bold uppercase text-accent tracking-widest">{product.category}</span>
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6 space-y-2 md:space-y-4">
                    <h3 className="text-xl md:text-3xl font-headline tracking-wide uppercase truncate leading-none">{product.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Qty: {product.stockQuantity ?? 0}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                      <span className="font-bold text-xl md:text-3xl text-accent">NRS {product.price.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button onClick={() => {setProductFormData(product); setEditingProductId(product.id); setIsAddingProduct(true);}} variant="outline" size="icon" className="w-10 h-10 rounded-xl border-white/10 hover:bg-accent hover:text-accent-foreground"><Settings className="w-4 h-4" /></Button>
                        <Button onClick={() => { if(confirm('Delete this product?')) deleteDocumentNonBlocking(doc(firestore, 'products', product.id)) }} variant="destructive" size="icon" className="w-10 h-10 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="combos" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-headline tracking-widest uppercase">COMBO PAIRINGS</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-60">Curated Experience Management</p>
              </div>
              <Button onClick={() => setIsAddingPairing(true)} className="w-full sm:w-auto bg-accent text-accent-foreground font-bold rounded-full px-10 h-14 shadow-xl"><Plus className="mr-2 h-5 w-5" /> ADD COMBO</Button>
            </div>

            {isAddingPairing && (
              <Card className="bg-card border-accent/30 overflow-hidden mb-12 shadow-3xl animate-in zoom-in-95 duration-300">
                <CardHeader className="bg-accent/5 py-8">
                  <CardTitle className="font-headline text-3xl md:text-4xl text-accent">{editingPairingId ? "EDIT COMBO" : "CREATE NEW COMBO"}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Combo Name</label>
                      <Input value={pairingFormData.name} onChange={e => setPairingFormData({...pairingFormData, name: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" placeholder="e.g. The Midnight Bourbon Pack" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Liquor Component</label>
                      <select value={pairingFormData.liquorProductId} onChange={e => setPairingFormData({...pairingFormData, liquorProductId: e.target.value})} className="w-full h-12 bg-background border border-white/10 rounded-xl px-4 text-sm focus:ring-accent">
                        <option value="">Select Liquor</option>
                        {liquorProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - NRS {p.price}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Snack Component</label>
                      <select value={pairingFormData.snackProductId} onChange={e => setPairingFormData({...pairingFormData, snackProductId: e.target.value})} className="w-full h-12 bg-background border border-white/10 rounded-xl px-4 text-sm focus:ring-accent">
                        <option value="">Select Snack</option>
                        {snackProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - NRS {p.price}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Combo Display Image URL</label>
                      <div className="flex gap-2">
                        <Input 
                          value={pairingFormData.imageUrl} 
                          onChange={e => setPairingFormData({...pairingFormData, imageUrl: e.target.value})} 
                          className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent flex-1" 
                          placeholder="https://..." 
                        />
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current['pairing_image'] = el }}
                          onChange={(e) => handleFormImageUpload(setPairingFormData, pairingFormData, e)}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-12 w-12 rounded-xl border-white/10 hover:bg-accent hover:text-accent-foreground"
                          onClick={() => fileInputRefs.current['pairing_image']?.click()}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-full space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Combo Story (Description)</label>
                      <Textarea value={pairingFormData.description} onChange={e => setPairingFormData({...pairingFormData, description: e.target.value})} className="bg-background border-white/10 rounded-xl min-h-[100px] focus:ring-accent" placeholder="Why does this pairing work so well?" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button onClick={handleSavePairing} className="flex-1 bg-accent text-accent-foreground font-bold h-14 rounded-2xl text-base shadow-xl"><Save className="mr-2 h-5 w-5" /> PUBLISH COMBO</Button>
                    <Button onClick={resetPairingForm} variant="outline" className="px-12 h-14 rounded-2xl font-bold border-white/10 hover:bg-white/5"><X className="mr-2 h-5 w-5" /> DISCARD</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              {isPairingsLoading ? (
                Array.from({length: 2}).map((_, i) => (
                  <div key={i} className="h-64 bg-card/20 animate-pulse rounded-3xl" />
                ))
              ) : pairings?.map(pairing => (
                <Card key={pairing.id} className="bg-card border-white/5 hover:border-accent/20 transition-all overflow-hidden shadow-xl group">
                  <CardContent className="p-10">
                    <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-accent/5 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:bg-accent transition-colors duration-500 overflow-hidden shadow-2xl">
                        {pairing.imageUrl ? (
                          <img src={pairing.imageUrl} alt={pairing.name} className="w-full h-full object-cover" />
                        ) : (
                          <Wine className="w-12 h-12 md:w-16 md:h-16 text-accent group-hover:text-black transition-colors duration-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-2">
                        <h3 className="text-3xl md:text-5xl font-headline tracking-wide uppercase truncate mb-4">{pairing.name}</h3>
                        <p className="text-sm md:text-base text-muted-foreground line-clamp-3 leading-relaxed font-light">{pairing.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-6 border-t border-white/5">
                      <Button onClick={() => {setPairingFormData(pairing); setEditingPairingId(pairing.id); setIsAddingPairing(true);}} variant="outline" size="sm" className="flex-1 font-bold h-12 rounded-2xl border-white/10 hover:bg-white/5 uppercase tracking-widest">EDIT COMBO</Button>
                      <Button onClick={() => { if(confirm('Remove this combo?')) deleteDocumentNonBlocking(doc(firestore, 'pairings', pairing.id)) }} variant="destructive" size="icon" className="w-12 h-12 rounded-2xl"><Trash2 className="w-5 h-5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-headline tracking-widest uppercase">FULFILLMENT CENTER</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-60">Real-time Order Processing</p>
              </div>
            </div>

            <div className="space-y-6">
              {orders?.map(order => (
                <Card key={order.id} className="bg-card border-white/5 p-6 md:p-8 hover:border-accent/20 transition-all shadow-xl group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/5 rounded-2xl border border-white/5">
                          <ShoppingCart className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-headline uppercase tracking-tight">#{order.id.slice(-8).toUpperCase()}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(order.orderDate).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Customer Context</p>
                          <p className="font-bold text-lg">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Phone className="w-3.5 h-3.5" /> {order.customerPhone || "No Phone Provided"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Order Items</p>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-xs font-medium"><span className="text-accent font-bold">{item.quantity}x</span> {item.name}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-6 md:min-w-[200px]">
                      <div className="flex items-center gap-3">
                         <select 
                          value={order.status} 
                          onChange={(e) => updateDocumentNonBlocking(doc(firestore, "orders", order.id), { status: e.target.value })}
                          className={`h-10 px-6 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-accent text-accent-foreground'
                          }`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="preparing">PREPARING</option>
                          <option value="out-for-delivery">OUT FOR DELIVERY</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                        <Button onClick={() => { if(confirm('Purge this order?')) deleteDocumentNonBlocking(doc(firestore, 'orders', order.id)) }} variant="destructive" size="icon" className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Total Valuation</p>
                        <p className="text-4xl font-headline text-accent">NRS {order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="riders" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-headline tracking-widest uppercase">RIDER FLEET</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-60">Delivery Logistics Management</p>
              </div>
              <Button onClick={() => setIsAddingDriver(true)} className="w-full sm:w-auto bg-accent text-accent-foreground font-bold rounded-full px-10 h-14 shadow-xl"><Plus className="mr-2 h-5 w-5" /> ADD RIDER</Button>
            </div>

            {isAddingDriver && (
              <Card className="bg-card border-accent/30 overflow-hidden mb-12 shadow-3xl animate-in zoom-in-95 duration-300">
                <CardHeader className="bg-accent/5 py-8">
                  <CardTitle className="font-headline text-3xl md:text-4xl text-accent">{editingDriverId ? "EDIT RIDER" : "REGISTER NEW RIDER"}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">First Name</label>
                      <Input value={driverFormData.firstName} onChange={e => setDriverFormData({...driverFormData, firstName: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Last Name</label>
                      <Input value={driverFormData.lastName} onChange={e => setDriverFormData({...driverFormData, lastName: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Contact Number</label>
                      <Input value={driverFormData.contactNumber} onChange={e => setDriverFormData({...driverFormData, contactNumber: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button onClick={handleSaveDriver} className="flex-1 bg-accent text-accent-foreground font-bold h-14 rounded-2xl text-base shadow-xl"><Save className="mr-2 h-5 w-5" /> REGISTER RIDER</Button>
                    <Button onClick={resetDriverForm} variant="outline" className="px-12 h-14 rounded-2xl font-bold border-white/10 hover:bg-white/5"><X className="mr-2 h-5 w-5" /> CANCEL</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {drivers?.map(driver => (
                <Card key={driver.id} className="bg-card border-white/5 p-8 flex flex-col items-center text-center space-y-6 shadow-xl hover:border-accent/20 transition-all">
                  <div className="relative">
                    <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center border-2 border-white/5">
                      <Bike className="w-10 h-10 text-accent" />
                    </div>
                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-card ${
                      driver.status === 'available' ? 'bg-green-500' : 
                      driver.status === 'on_delivery' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-headline uppercase leading-none">{driver.firstName} {driver.lastName}</h4>
                    <p className="text-xs text-muted-foreground mt-2 font-bold tracking-widest uppercase">{driver.contactNumber}</p>
                  </div>
                  <div className="flex gap-2 w-full pt-4 border-t border-white/5">
                    <Button onClick={() => {setDriverFormData(driver); setEditingDriverId(driver.id); setIsAddingDriver(true);}} variant="outline" className="flex-1 rounded-xl h-10 text-[10px] font-bold border-white/10 uppercase tracking-widest">Edit</Button>
                    <Button onClick={() => deleteDocumentNonBlocking(doc(firestore, 'drivers', driver.id))} variant="destructive" size="icon" className="w-10 h-10 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="bg-card border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">User Identity</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Contact Info</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Loyalty Status</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Privileges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users?.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center font-bold text-accent">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-lg leading-tight">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-medium">{u.email}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{u.phoneNumber}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-headline text-2xl">{u.loyaltyPoints.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className={u.isAdmin ? "bg-accent text-accent-foreground" : "bg-white/5 text-muted-foreground"}>
                            {u.isAdmin ? "ADMINISTRATOR" : "NIGHT OWL"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="bg-card border-white/5 p-8 md:p-12 space-y-12 shadow-2xl">
              <div>
                <h2 className="text-4xl font-headline tracking-widest uppercase mb-4">SYSTEM PREFERENCES</h2>
                <p className="text-muted-foreground font-light max-w-2xl">Global configurations for the store identity, delivery parameters, and automated marketing copy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Store Name</label>
                  <Input value={storeSettings?.storeName || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {storeName: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Club Identity (Loyalty)</label>
                  <Input value={storeSettings?.clubName || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {clubName: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Contact Number</label>
                  <Input value={storeSettings?.contactNumber || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {contactNumber: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                </div>
                 <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">WhatsApp Support</label>
                  <Input value={storeSettings?.whatsappNumber || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {whatsappNumber: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                </div>
                 <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Instagram URL</label>
                  <Input value={storeSettings?.instagramUrl || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {instagramUrl: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                </div>
                 <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Facebook URL</label>
                  <Input value={storeSettings?.facebookUrl || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {facebookUrl: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Delivery Fee (NRS)</label>
                  <Input type="number" value={storeSettings?.deliveryFee || 150} onChange={e => setDocumentNonBlocking(settingsRef!, {deliveryFee: Number(e.target.value)}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl focus:ring-accent" />
                </div>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-8">
                <h3 className="text-2xl font-headline uppercase tracking-widest">Branding & Dynamic Copy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Hero Headline</label>
                    <Input value={storeSettings?.heroTitle || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {heroTitle: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Hero Subtitle</label>
                    <Input value={storeSettings?.heroSubtitle || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {heroSubtitle: e.target.value}, {merge: true})} className="bg-background border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="col-span-full space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Club Description</label>
                    <Textarea value={storeSettings?.clubDescription || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {clubDescription: e.target.value}, {merge: true})} className="bg-background border-white/10 rounded-xl min-h-[100px]" />
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-8">
                <h3 className="text-2xl font-headline uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Imagery Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[
                    { label: "Store Logo URL", field: "logoUrl" as keyof StoreSettings },
                    { label: "Favicon URL (32x32 PNG)", field: "faviconUrl" as keyof StoreSettings },
                    { label: "Hero Image URL", field: "heroImageUrl" as keyof StoreSettings },
                    { label: "Delivery Background URL", field: "deliveryImageUrl" as keyof StoreSettings },
                    { label: "Club घ्याम्पे Image", field: "clubImageUrl" as keyof StoreSettings },
                    { label: "Spirits Category URL", field: "spiritsImageUrl" as keyof StoreSettings },
                    { label: "Wine Category URL", field: "wineImageUrl" as keyof StoreSettings },
                    { label: "Beer Category URL", field: "beerImageUrl" as keyof StoreSettings },
                    { label: "Snacks Category URL", field: "snacksImageUrl" as keyof StoreSettings },
                    { label: "Vapes Category URL", field: "vapesImageUrl" as keyof StoreSettings },
                  ].map((item) => (
                    <div key={item.field} className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">{item.label}</label>
                      <div className="flex gap-2">
                        <Input 
                          value={storeSettings?.[item.field] as string || ""} 
                          onChange={e => setDocumentNonBlocking(settingsRef!, { [item.field]: e.target.value }, { merge: true })} 
                          className="bg-background border-white/10 h-12 rounded-xl flex-1" 
                          placeholder="https://..." 
                        />
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/x-icon"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[item.field] = el }}
                          onChange={(e) => handleFileUpload(item.field, e)}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-12 w-12 rounded-xl border-white/10 hover:bg-accent hover:text-accent-foreground"
                          onClick={() => fileInputRefs.current[item.field]?.click()}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-accent/5 rounded-2xl border border-accent/20">
                <ShieldAlert className="w-8 h-8 text-accent animate-pulse" />
                <div>
                  <p className="font-bold text-lg uppercase leading-none">Settings Persistance</p>
                  <p className="text-xs text-muted-foreground font-light mt-1">Changes are saved automatically using non-blocking updates.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
