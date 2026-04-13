
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
  TrendingUp, Clock, AlertCircle, ShieldAlert, Bike, Phone, ImageIcon, Wine, Sparkles, Moon, Download, Calendar, Star, Upload
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
    
    const pdf = new jsPDF();
    const storeName = storeSettings?.storeName || "RAKSHIMANDU";
    const reportDate = new Date().toLocaleDateString();
    
    pdf.setFontSize(22);
    pdf.setTextColor(180, 0, 0); 
    pdf.text(storeName.toUpperCase(), 14, 20);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("SALES & FULFILLMENT REPORT", 14, 30);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${reportDate}`, 14, 38);
    
    pdf.setDrawColor(200, 200, 200);
    pdf.line(14, 42, 196, 42);

    const tableData = orders.map(order => [
      order.id.slice(-8).toUpperCase(),
      order.customerName,
      `NRS ${order.totalAmount.toLocaleString()}`,
      order.status.toUpperCase(),
      new Date(order.orderDate).toLocaleDateString()
    ]);
    
    autoTable(pdf, {
      startY: 50,
      head: [['ORDER ID', 'CUSTOMER', 'AMOUNT', 'STATUS', 'DATE']],
      body: tableData,
    });
    
    pdf.save(`${storeName.toLowerCase()}_sales_report.pdf`);
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

    if (file.size > 800000) {
      toast({ variant: "destructive", title: "File too large", description: "Keep images under 800KB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setDocumentNonBlocking(settingsRef!, { [field]: base64String }, { merge: true });
      toast({ title: "Image Uploaded" });
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
      toast({ variant: "destructive", title: "File too large" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setter({ ...currentData, imageUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  if (isStatusChecking) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </main>
    );
  }
  
  if (!user || !isAdminConfirmed) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-headline text-red-500">ACCESS DENIED</h1>
    </div>
  );

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <h1 className="text-5xl md:text-8xl font-headline uppercase leading-none">
            {storeSettings?.storeName || "RAKSHIMANDU"} <span className="text-accent">ADMIN</span>
          </h1>
          <Button onClick={downloadSalesReport} variant="outline" className="rounded-full">
            <Download className="mr-2 w-4 h-4" /> SALES REPORT
          </Button>
        </header>

        <Tabs defaultValue="products" className="space-y-10">
          <TabsList className="bg-card border border-white/5 h-auto p-1 grid grid-cols-2 md:grid-cols-5 gap-1 rounded-2xl">
            <TabsTrigger value="products">PRODUCTS</TabsTrigger>
            <TabsTrigger value="combos">COMBOS</TabsTrigger>
            <TabsTrigger value="orders">ORDERS</TabsTrigger>
            <TabsTrigger value="riders">RIDERS</TabsTrigger>
            <TabsTrigger value="settings">SETTINGS</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-headline">CATALOG</h2>
              <Button onClick={() => setIsAddingProduct(true)} className="rounded-full"><Plus className="mr-2" /> ADD ITEM</Button>
            </div>

            {isAddingProduct && (
              <Card className="bg-card border-accent/30 p-6 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input placeholder="Name" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} />
                  <Input placeholder="Price" type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} />
                  <div className="flex gap-2">
                    <Input placeholder="Image URL" value={productFormData.imageUrl} onChange={e => setProductFormData({...productFormData, imageUrl: e.target.value})} className="flex-1" />
                    <input type="file" className="hidden" ref={el => fileInputRefs.current['prod'] = el} onChange={e => handleFormImageUpload(setProductFormData, productFormData, e)} />
                    <Button size="icon" variant="outline" onClick={() => fileInputRefs.current['prod']?.click()}><Upload className="w-4 h-4" /></Button>
                  </div>
                  <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value as any})} className="bg-background border rounded-md px-3">
                    <option value="Spirits">Spirits</option>
                    <option value="Wine">Wine</option>
                    <option value="Beer">Beer</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Vapes">Vapes</option>
                  </select>
                </div>
                <Textarea placeholder="Description" value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} />
                <div className="flex gap-4">
                  <Button onClick={handleSaveProduct} className="flex-1">SAVE PRODUCT</Button>
                  <Button onClick={resetProductForm} variant="ghost">CANCEL</Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products?.map(product => (
                <Card key={product.id} className="bg-card border-white/5 overflow-hidden">
                  <img src={product.imageUrl} className="aspect-square object-cover" alt={product.name} />
                  <div className="p-4 space-y-2">
                    <h3 className="font-headline text-xl uppercase truncate">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-accent font-bold">NRS {product.price}</span>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => {setProductFormData(product); setEditingProductId(product.id); setIsAddingProduct(true);}}><Settings className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteDocumentNonBlocking(doc(firestore, 'products', product.id))}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-12">
            <Card className="bg-card border-white/5 p-8 md:p-12 space-y-10">
              <h2 className="text-4xl font-headline uppercase">STORE SETTINGS</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50">Store Name</label>
                  <Input value={storeSettings?.storeName || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {storeName: e.target.value}, {merge: true})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50">Club Name</label>
                  <Input value={storeSettings?.clubName || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {clubName: e.target.value}, {merge: true})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50">Delivery Fee (NRS)</label>
                  <Input type="number" value={storeSettings?.deliveryFee || 0} onChange={e => setDocumentNonBlocking(settingsRef!, {deliveryFee: Number(e.target.value)}, {merge: true})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-white/5 pt-10">
                {[
                  { label: "Logo URL", field: "logoUrl" as keyof StoreSettings },
                  { label: "Favicon URL", field: "faviconUrl" as keyof StoreSettings },
                  { label: "Hero Background", field: "heroImageUrl" as keyof StoreSettings },
                  { label: "Delivery Background", field: "deliveryImageUrl" as keyof StoreSettings },
                  { label: "Club Background", field: "clubImageUrl" as keyof StoreSettings },
                ].map((item) => (
                  <div key={item.field} className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">{item.label}</label>
                    <div className="flex gap-2">
                      <Input value={storeSettings?.[item.field] as string || ""} onChange={e => setDocumentNonBlocking(settingsRef!, { [item.field]: e.target.value }, { merge: true })} className="flex-1" />
                      <input type="file" className="hidden" ref={el => fileInputRefs.current[item.field] = el} onChange={e => handleFileUpload(item.field, e)} />
                      <Button size="icon" variant="outline" onClick={() => fileInputRefs.current[item.field]?.click()}><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-10 space-y-6">
                <h3 className="text-2xl font-headline">Dynamic Copy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Hero Headline</label>
                    <Input value={storeSettings?.heroTitle || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {heroTitle: e.target.value}, {merge: true})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Hero Subtitle</label>
                    <Input value={storeSettings?.heroSubtitle || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {heroSubtitle: e.target.value}, {merge: true})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50">Club Description</label>
                  <Textarea value={storeSettings?.clubDescription || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {clubDescription: e.target.value}, {merge: true})} />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
