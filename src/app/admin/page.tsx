
"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, query, orderBy } from "firebase/firestore";
import { Product, Order, UserProfile, StoreSettings, Driver, Pairing } from "@/lib/types";
import { 
  Plus, Trash2, Settings, Loader2, Download, Upload, Star, Phone, Instagram, Facebook, MessageSquare, Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
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

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || isStatusChecking || !isAdminConfirmed) return null;
    return doc(firestore, "settings", "store_config");
  }, [firestore, isStatusChecking, isAdminConfirmed]);

  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);
  const { data: orders } = useCollection<Order>(ordersQuery);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

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

  const downloadSalesReport = () => {
    if (!orders || orders.length === 0) {
      toast({ title: "No Data", description: "No orders found.", variant: "destructive" });
      return;
    }
    const pdf = new jsPDF();
    const reportDate = new Date().toLocaleDateString();
    pdf.setFontSize(22);
    pdf.text((storeSettings?.storeName || "RAKSHIMANDU").toUpperCase(), 14, 20);
    pdf.setFontSize(16);
    pdf.text("SALES REPORT", 14, 30);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${reportDate}`, 14, 38);
    autoTable(pdf, {
      startY: 45,
      head: [['ORDER ID', 'CUSTOMER', 'AMOUNT', 'STATUS', 'DATE']],
      body: orders.map(o => [o.id.slice(-8).toUpperCase(), o.customerName, `NRS ${o.totalAmount}`, o.status, new Date(o.orderDate).toLocaleDateString()]),
    });
    pdf.save("sales_report.pdf");
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
    resetProductForm();
  };

  const resetProductForm = () => {
    setProductFormData({ name: "", brand: "", description: "", price: 0, category: "Spirits", imageUrl: "", rating: 5, isAgeRestricted: true, stockStatus: 'in-stock', stockQuantity: 0 });
    setEditingProductId(null);
    setIsAddingProduct(false);
  };

  if (isStatusChecking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user || !isAdminConfirmed) return <div className="min-h-screen flex items-center justify-center font-headline text-4xl">ACCESS DENIED</div>;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-28">
        <header className="mb-12 flex justify-between items-end">
          <h1 className="text-6xl font-headline uppercase leading-none">
            {storeSettings?.storeName || "RAKSHIMANDU"} <span className="text-accent">ADMIN</span>
          </h1>
          <Button onClick={downloadSalesReport} variant="outline" className="rounded-full">
            <Download className="mr-2 w-4 h-4" /> SALES REPORT
          </Button>
        </header>

        <Tabs defaultValue="products" className="space-y-10">
          <TabsList className="bg-card border border-white/5 h-auto p-1 grid grid-cols-3 gap-1 rounded-2xl">
            <TabsTrigger value="products">CATALOG</TabsTrigger>
            <TabsTrigger value="orders">ORDERS</TabsTrigger>
            <TabsTrigger value="settings">SYSTEM PREFERENCES</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-headline uppercase">Items In Cellar</h2>
              <Button onClick={() => setIsAddingProduct(true)} className="rounded-full"><Plus className="mr-2" /> ADD NEW ITEM</Button>
            </div>

            {isAddingProduct && (
              <Card className="bg-card border-accent/30 p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Item Name</label>
                    <Input value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Price (NRS)</label>
                    <Input type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Category</label>
                    <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value as any})} className="w-full h-10 bg-background border rounded-md px-3 text-sm">
                      <option value="Spirits">Spirits</option>
                      <option value="Wine">Wine</option>
                      <option value="Beer">Beer</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Vapes">Vapes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50">Image Source (URL or Upload)</label>
                    <div className="flex gap-2">
                      <Input value={productFormData.imageUrl} onChange={e => setProductFormData({...productFormData, imageUrl: e.target.value})} className="flex-1" />
                      <input type="file" className="hidden" ref={el => fileInputRefs.current['prod'] = el} onChange={e => handleFormImageUpload(setProductFormData, productFormData, e)} />
                      <Button size="icon" variant="outline" onClick={() => fileInputRefs.current['prod']?.click()}><Upload className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50">Description</label>
                  <Textarea value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSaveProduct} className="flex-1">SAVE TO CELLAR</Button>
                  <Button onClick={resetProductForm} variant="ghost">CANCEL</Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

          <TabsContent value="settings" className="space-y-12">
            <Card className="bg-card border-white/5 p-8 space-y-10">
              <div className="space-y-10">
                <section className="space-y-6">
                  <h3 className="text-2xl font-headline uppercase border-b border-white/5 pb-2">Branding & Identity</h3>
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
                      <Input type="number" value={storeSettings?.deliveryFee || 150} onChange={e => setDocumentNonBlocking(settingsRef!, {deliveryFee: Number(e.target.value)}, {merge: true})} />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-2xl font-headline uppercase border-b border-white/5 pb-2">Contact & Socials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2"><Phone className="w-3 h-3" /> Contact Number</label>
                      <Input value={storeSettings?.contactNumber || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {contactNumber: e.target.value}, {merge: true})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> WhatsApp Number</label>
                      <Input value={storeSettings?.whatsappNumber || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {whatsappNumber: e.target.value}, {merge: true})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2"><Instagram className="w-3 h-3" /> Instagram URL</label>
                      <Input value={storeSettings?.instagramUrl || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {instagramUrl: e.target.value}, {merge: true})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2"><Facebook className="w-3 h-3" /> Facebook URL</label>
                      <Input value={storeSettings?.facebookUrl || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {facebookUrl: e.target.value}, {merge: true})} />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-2xl font-headline uppercase border-b border-white/5 pb-2">Imagery Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                      { label: "Store Logo", field: "logoUrl" as keyof StoreSettings },
                      { label: "Favicon URL", field: "faviconUrl" as keyof StoreSettings },
                      { label: "Hero Image", field: "heroImageUrl" as keyof StoreSettings },
                      { label: "Delivery Background", field: "deliveryImageUrl" as keyof StoreSettings },
                      { label: "Club Background", field: "clubImageUrl" as keyof StoreSettings },
                      { label: "Spirits Category", field: "spiritsImageUrl" as keyof StoreSettings },
                      { label: "Wine Category", field: "wineImageUrl" as keyof StoreSettings },
                      { label: "Beer Category", field: "beerImageUrl" as keyof StoreSettings },
                      { label: "Snacks Category", field: "snacksImageUrl" as keyof StoreSettings },
                      { label: "Vapes Category", field: "vapesImageUrl" as keyof StoreSettings },
                    ].map((item) => (
                      <div key={item.field} className="space-y-2">
                        <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> {item.label}</label>
                        <div className="flex gap-2">
                          <Input value={storeSettings?.[item.field] as string || ""} onChange={e => setDocumentNonBlocking(settingsRef!, { [item.field]: e.target.value }, { merge: true })} className="flex-1" />
                          <input type="file" className="hidden" ref={el => fileInputRefs.current[item.field] = el} onChange={e => handleFileUpload(item.field, e)} />
                          <Button size="icon" variant="outline" onClick={() => fileInputRefs.current[item.field]?.click()}><Upload className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section className="space-y-6">
                  <h3 className="text-2xl font-headline uppercase border-b border-white/5 pb-2">Hero & Club Copy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50">Hero Title</label>
                      <Input value={storeSettings?.heroTitle || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {heroTitle: e.target.value}, {merge: true})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50">Hero Subtitle</label>
                      <Input value={storeSettings?.heroSubtitle || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {heroSubtitle: e.target.value}, {merge: true})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase opacity-50">Club Description</label>
                      <Textarea value={storeSettings?.clubDescription || ""} onChange={e => setDocumentNonBlocking(settingsRef!, {clubDescription: e.target.value}, {merge: true})} />
                    </div>
                  </div>
                </section>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
