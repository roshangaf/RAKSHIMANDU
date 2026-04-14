
"use client";

import { useState, useRef, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, query, orderBy } from "firebase/firestore";
import { Product, Order, UserProfile, StoreSettings, Pairing } from "@/lib/types";
import { 
  Plus, Trash2, Settings, Loader2, Download, Upload, Star, Wine, Package, ShoppingBag, DollarSign, TrendingUp, BarChart3, Users as UsersIcon, ImageIcon, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadField, setActiveUploadField] = useState<{ type: 'product' | 'pairing' | 'settings', field: string } | null>(null);
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddingCombo, setIsAddingCombo] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: "", brand: "", description: "", price: 0, category: "Spirits", imageUrl: "", rating: 5, isAgeRestricted: true, stockStatus: 'in-stock', stockQuantity: 0
  });

  const [comboFormData, setComboFormData] = useState<Partial<Pairing>>({
    name: "", description: "", liquorProductId: "", snackProductId: "", imageUrl: ""
  });

  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'admin_roles', user.uid);
  }, [firestore, user]);
  
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isAdminConfirmed = !!adminRole || user?.uid === "Q3AAJKZAPvZYvcTEkLatjWP1ftD2";
  const isStatusChecking = isUserLoading || isAdminRoleLoading;

  // Collections
  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdminConfirmed) return null;
    return query(collection(firestore, "products"), orderBy("name"));
  }, [firestore, isAdminConfirmed]);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdminConfirmed) return null;
    return query(collection(firestore, "orders"), orderBy("orderDate", "desc"));
  }, [firestore, isAdminConfirmed]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdminConfirmed) return null;
    return query(collection(firestore, "users"), orderBy("email"));
  }, [firestore, isAdminConfirmed]);

  const pairingsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdminConfirmed) return null;
    return query(collection(firestore, "pairings"), orderBy("name"));
  }, [firestore, isAdminConfirmed]);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !isAdminConfirmed) return null;
    return doc(firestore, "settings", "store_config");
  }, [firestore, isAdminConfirmed]);

  const { data: products } = useCollection<Product>(productsQuery);
  const { data: orders } = useCollection<Order>(ordersQuery);
  const { data: users } = useCollection<UserProfile>(usersQuery);
  const { data: pairings } = useCollection<Pairing>(pairingsQuery);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  // Analytics
  const stats = useMemo(() => {
    if (!orders || !products || !users) return null;
    
    const now = new Date();
    const todayStr = now.toLocaleDateString();

    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const dailySales = orders
      .filter(o => new Date(o.orderDate).toLocaleDateString() === todayStr)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const activeOrdersCount = orders.filter(o => ['pending', 'preparing', 'out-for-delivery'].includes(o.status)).length;

    const salesByDate = completedOrders.reduce((acc: any, order) => {
      const date = new Date(order.orderDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + order.totalAmount;
      return acc;
    }, {});
    const chartData = Object.entries(salesByDate).map(([date, total]) => ({ date, total })).slice(-7);

    return { 
      totalRevenue, 
      dailySales,
      activeOrdersCount,
      orderCount: orders.length, 
      userCount: users.length, 
      productCount: products.length, 
      chartData 
    };
  }, [orders, products, users]);

  const triggerUpload = (type: 'product' | 'pairing' | 'settings', field: string) => {
    setActiveUploadField({ type, field });
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadField) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (activeUploadField.type === 'product') {
        setProductFormData(prev => ({ ...prev, [activeUploadField.field]: result }));
      } else if (activeUploadField.type === 'pairing') {
        setComboFormData(prev => ({ ...prev, [activeUploadField.field]: result }));
      } else if (activeUploadField.type === 'settings') {
        setDocumentNonBlocking(settingsRef!, { [activeUploadField.field]: result }, { merge: true });
      }
      toast({ title: "Image Uploaded Successfully" });
      setActiveUploadField(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = () => {
    if (!productFormData.name || !productFormData.imageUrl) {
      toast({ title: "Missing Data", variant: "destructive" });
      return;
    }
    if (editingProductId) {
      updateDocumentNonBlocking(doc(firestore, "products", editingProductId), productFormData);
    } else {
      addDocumentNonBlocking(collection(firestore, "products"), { ...productFormData, id: Date.now().toString() });
    }
    setIsAddingProduct(false);
    setEditingProductId(null);
  };

  const handleSaveCombo = () => {
    if (!comboFormData.name || !comboFormData.liquorProductId || !comboFormData.snackProductId) {
      toast({ title: "Missing Data", variant: "destructive" });
      return;
    }
    if (editingComboId) {
      updateDocumentNonBlocking(doc(firestore, "pairings", editingComboId), comboFormData);
    } else {
      addDocumentNonBlocking(collection(firestore, "pairings"), { ...comboFormData, id: Date.now().toString() });
    }
    setIsAddingCombo(false);
    setEditingComboId(null);
  };

  const downloadSalesReport = () => {
    if (!orders?.length) return;
    const pdf = new jsPDF();
    pdf.setFontSize(22);
    pdf.text((storeSettings?.storeName || "RAKSHIMANDU").toUpperCase(), 14, 20);
    pdf.setFontSize(16);
    pdf.text("SALES REPORT", 14, 30);
    autoTable(pdf, {
      startY: 45,
      head: [['ID', 'CUSTOMER', 'AMOUNT', 'STATUS', 'DATE']],
      body: orders.map(o => [o.id.slice(-6), o.customerName, `NRS ${o.totalAmount}`, o.status, new Date(o.orderDate).toLocaleDateString()]),
    });
    pdf.save("sales_report.pdf");
  };

  if (isStatusChecking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user || !isAdminConfirmed) return <div className="min-h-screen flex items-center justify-center font-headline text-4xl">ACCESS DENIED</div>;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/png, image/jpeg" 
        onChange={handleFileUpload} 
      />
      <div className="container mx-auto px-4 pt-28">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-6xl font-headline uppercase leading-none tracking-tight">
              {storeSettings?.storeName || "RAKSHIMANDU"} <span className="text-accent">DASHBOARD</span>
            </h1>
            <p className="text-muted-foreground mt-2 uppercase tracking-widest text-xs font-bold opacity-60">Control Center & Analytics</p>
          </div>
          <Button onClick={downloadSalesReport} variant="outline" className="rounded-full border-white/10 hover:bg-white/5">
            <Download className="mr-2 w-4 h-4" /> EXPORT SALES DATA
          </Button>
        </header>

        <Tabs defaultValue="overview" className="space-y-10">
          <TabsList className="bg-card border border-white/5 h-auto p-1 grid grid-cols-3 md:grid-cols-6 gap-1 rounded-2xl">
            <TabsTrigger value="overview" className="flex gap-2"><BarChart3 className="w-4 h-4" /> OVERVIEW</TabsTrigger>
            <TabsTrigger value="products" className="flex gap-2"><Package className="w-4 h-4" /> ITEMS</TabsTrigger>
            <TabsTrigger value="combos" className="flex gap-2"><Wine className="w-4 h-4" /> COMBOS</TabsTrigger>
            <TabsTrigger value="orders" className="flex gap-2"><ShoppingBag className="w-4 h-4" /> ORDERS</TabsTrigger>
            <TabsTrigger value="users" className="flex gap-2"><UsersIcon className="w-4 h-4" /> USERS</TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2"><Settings className="w-4 h-4" /> SYSTEM</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: "Total Revenue", value: `NRS ${stats?.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
                { label: "Today's Sales", value: `NRS ${stats?.dailySales.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
                { label: "Active Orders", value: stats?.activeOrdersCount, icon: Zap, color: "text-yellow-500" },
                { label: "Total Orders", value: stats?.orderCount, icon: ShoppingBag, color: "text-blue-500" },
                { label: "Active Users", value: stats?.userCount, icon: UsersIcon, color: "text-purple-500" },
                { label: "Items in Cellar", value: stats?.productCount, icon: Package, color: "text-orange-500" },
              ].map((stat, i) => (
                <Card key={i} className="bg-card border-white/5 p-6 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">{stat.label}</p>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-4xl font-headline tracking-tight">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-white/5 p-8">
              <h3 className="text-2xl font-headline uppercase flex items-center gap-2 mb-8">
                <TrendingUp className="text-accent w-6 h-6" /> Sales Performance
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="white" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="white" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `NRS ${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: 'white', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="total" stroke="white" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-headline uppercase">Items In Cellar</h2>
              <Button onClick={() => {setIsAddingProduct(true); setProductFormData({name: "", brand: "", description: "", price: 0, category: "Spirits", imageUrl: "", rating: 5, isAgeRestricted: true, stockStatus: 'in-stock', stockQuantity: 0}); setEditingProductId(null);}} className="rounded-full bg-accent text-accent-foreground"><Plus className="mr-2 w-4 h-4" /> ADD ITEM</Button>
            </div>

            {isAddingProduct && (
              <Card className="bg-card border-accent/30 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Item Name</label>
                    <Input value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Price (NRS)</label>
                    <Input type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} className="bg-background border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Category</label>
                    <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value as any})} className="w-full h-12 bg-background border border-white/10 rounded-xl px-3 text-sm">
                      <option value="Spirits">Spirits</option>
                      <option value="Wine">Wine</option>
                      <option value="Beer">Beer</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Vapes">Vapes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Image URL / Upload</label>
                    <div className="flex gap-2">
                      <Input value={productFormData.imageUrl} onChange={e => setProductFormData({...productFormData, imageUrl: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl flex-1" placeholder="https://..." />
                      <Button onClick={() => triggerUpload('product', 'imageUrl')} variant="secondary" className="h-12 w-12 rounded-xl shrink-0"><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50">Description</label>
                  <Textarea value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} className="bg-background border-white/10 min-h-[100px] rounded-xl" />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSaveProduct} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest bg-accent text-accent-foreground">SAVE PRODUCT</Button>
                  <Button onClick={() => setIsAddingProduct(false)} variant="ghost" className="h-12 rounded-xl">CANCEL</Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products?.map(product => (
                <Card key={product.id} className="bg-card border-white/5 overflow-hidden group">
                  <div className="aspect-square relative">
                    <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-headline text-lg uppercase truncate">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-accent font-bold">NRS {product.price}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => {setProductFormData(product); setEditingProductId(product.id); setIsAddingProduct(true);}}><Settings className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteDocumentNonBlocking(doc(firestore, 'products', product.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="combos" className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-headline uppercase">Curated Combos</h2>
              <Button onClick={() => {setIsAddingCombo(true); setComboFormData({name: "", description: "", liquorProductId: "", snackProductId: "", imageUrl: ""}); setEditingComboId(null);}} className="rounded-full bg-accent text-accent-foreground"><Plus className="mr-2 w-4 h-4" /> NEW COMBO</Button>
            </div>

            {isAddingCombo && (
              <Card className="bg-card border-accent/30 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Combo Name</label>
                    <Input value={comboFormData.name} onChange={e => setComboFormData({...comboFormData, name: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Combo Image URL / Upload</label>
                    <div className="flex gap-2">
                      <Input value={comboFormData.imageUrl} onChange={e => setComboFormData({...comboFormData, imageUrl: e.target.value})} className="bg-background border-white/10 h-12 rounded-xl flex-1" placeholder="https://..." />
                      <Button onClick={() => triggerUpload('pairing', 'imageUrl')} variant="secondary" className="h-12 w-12 rounded-xl shrink-0"><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Liquor Product</label>
                    <select value={comboFormData.liquorProductId} onChange={e => setComboFormData({...comboFormData, liquorProductId: e.target.value})} className="w-full h-12 bg-background border border-white/10 rounded-xl px-3 text-sm">
                      <option value="">Select Liquor</option>
                      {products?.filter(p => ['Spirits', 'Wine', 'Beer'].includes(p.category)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Snack Product</label>
                    <select value={comboFormData.snackProductId} onChange={e => setComboFormData({...comboFormData, snackProductId: e.target.value})} className="w-full h-12 bg-background border border-white/10 rounded-xl px-3 text-sm">
                      <option value="">Select Snack</option>
                      {products?.filter(p => p.category === 'Snacks').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50">Combo Description</label>
                  <Textarea value={comboFormData.description} onChange={e => setComboFormData({...comboFormData, description: e.target.value})} className="bg-background border-white/10 min-h-[100px] rounded-xl" />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSaveCombo} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest bg-accent text-accent-foreground">SAVE COMBO</Button>
                  <Button onClick={() => setIsAddingCombo(false)} variant="ghost" className="h-12 rounded-xl">CANCEL</Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pairings?.map(combo => (
                <Card key={combo.id} className="bg-card border-white/5 p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Wine className="w-8 h-8 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-xl uppercase truncate">{combo.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{combo.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => {setComboFormData(combo); setEditingComboId(combo.id); setIsAddingCombo(true);}}><Settings className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteDocumentNonBlocking(doc(firestore, 'pairings', combo.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-4">
              {orders?.map(order => (
                <Card key={order.id} className="bg-card border-white/5 p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-headline text-2xl uppercase">#{order.id.slice(-6)}</span>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-accent">{order.customerName}</p>
                      <p className="text-xs opacity-50">{new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <p className="text-2xl font-headline">NRS {order.totalAmount}</p>
                      <div className="flex gap-2">
                        {order.status !== 'completed' && (
                          <Button size="sm" onClick={() => updateDocumentNonBlocking(doc(firestore, "orders", order.id), { status: 'completed' })} className="bg-green-600 hover:bg-green-700 h-8 text-[10px] font-bold">MARK DELIVERED</Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold text-red-500" onClick={() => deleteDocumentNonBlocking(doc(firestore, "orders", order.id))}>DELETE</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5 grid grid-cols-4 text-[10px] font-bold uppercase tracking-widest opacity-50">
                <span>Customer</span>
                <span>Points</span>
                <span>Role</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-white/5">
                {users?.map(u => (
                  <div key={u.id} className="p-4 grid grid-cols-4 items-center">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] opacity-40 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="font-headline text-lg">{u.loyaltyPoints}</span>
                    </div>
                    <div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${u.isAdmin ? 'bg-accent text-accent-foreground' : 'bg-white/10'}`}>
                        {u.isAdmin ? "ADMIN" : "CUSTOMER"}
                      </span>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="ghost" className="text-accent h-7 text-[10px]" onClick={() => updateDocumentNonBlocking(doc(firestore, "users", u.id), { isAdmin: !u.isAdmin })}>
                        TOGGLE ROLE
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-12">
            <Card className="bg-card border-white/5 p-8 space-y-10">
              <section className="space-y-6">
                <h3 className="text-2xl font-headline uppercase border-b border-white/5 pb-2">Branding & Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Store Name</label>
                    <Input value={storeSettings?.storeName || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {storeName: e.target.value}, {merge: true})} className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Logo URL / Upload</label>
                    <div className="flex gap-2">
                      <Input value={storeSettings?.logoUrl || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {logoUrl: e.target.value}, {merge: true})} className="rounded-xl h-12 flex-1" />
                      <Button onClick={() => triggerUpload('settings', 'logoUrl')} variant="secondary" className="h-12 w-12 rounded-xl shrink-0"><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Delivery Fee (NRS)</label>
                    <Input type="number" value={storeSettings?.deliveryFee || 150} onChange={e => setDocumentNonBlocking(settingsRef!, {deliveryFee: Number(e.target.value)}, {merge: true})} className="rounded-xl h-12" />
                  </div>
                </div>
              </section>
              
              <section className="space-y-6">
                <h3 className="text-2xl font-headline uppercase border-b border-white/5 pb-2">Category Imagery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {['spirits', 'wine', 'beer', 'snacks', 'vapes'].map(cat => (
                    <div key={cat} className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50">{cat} IMAGE URL / UPLOAD</label>
                      <div className="flex gap-2">
                        <Input 
                          value={(storeSettings as any)?.[`${cat}ImageUrl`] || ""} 
                          onChange={e => setDocumentNonBlocking(settingsRef!, {[`${cat}ImageUrl`]: e.target.value}, {merge: true})} 
                          className="rounded-xl h-12 flex-1"
                        />
                        <Button onClick={() => triggerUpload('settings', `${cat}ImageUrl`)} variant="secondary" className="h-12 w-12 rounded-xl shrink-0"><Upload className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
