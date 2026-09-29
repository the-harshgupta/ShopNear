package com.retail.platform.config;

import com.retail.platform.model.*;
import com.retail.platform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final SectionRepository sectionRepository;
    private final AisleRepository aisleRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final StoreProductRepository storeProductRepository;
    private final OfferRepository offerRepository;
    private final SaleRepository saleRepository;
    private final OrderRepository orderRepository;
    private final DemandLogRepository demandLogRepository;
    private final OperationalIssueRepository operationalIssueRepository;
    private final StoreReviewRepository storeReviewRepository;

    public DataInitializer(
            UserRepository userRepository,
            StoreRepository storeRepository,
            SectionRepository sectionRepository,
            AisleRepository aisleRepository,
            CategoryRepository categoryRepository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository,
            StoreProductRepository storeProductRepository,
            OfferRepository offerRepository,
            SaleRepository saleRepository,
            OrderRepository orderRepository,
            DemandLogRepository demandLogRepository,
            OperationalIssueRepository operationalIssueRepository,
            StoreReviewRepository storeReviewRepository) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.sectionRepository = sectionRepository;
        this.aisleRepository = aisleRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.storeProductRepository = storeProductRepository;
        this.offerRepository = offerRepository;
        this.saleRepository = saleRepository;
        this.orderRepository = orderRepository;
        this.demandLogRepository = demandLogRepository;
        this.operationalIssueRepository = operationalIssueRepository;
        this.storeReviewRepository = storeReviewRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // 1. Seed Users for all roles and shops
        User customerUser = userRepository.save(new User("Akash Sharma", "customer@retail.com", "pass123", Role.CUSTOMER, "+91 98765 43210"));
        User shopkeeperUser = userRepository.save(new User("Ramesh Gupta", "shopkeeper@retail.com", "pass123", Role.SHOPKEEPER, "+91 98230 55443"));
        User harshUser = userRepository.save(new User("Harsh Vardhan", "harsh@retail.com", "pass123", Role.SHOPKEEPER, "+91 98111 22334"));
        User patelUser = userRepository.save(new User("Suresh Patel", "patel@retail.com", "pass123", Role.SHOPKEEPER, "+91 98221 44556"));
        User krishnaUser = userRepository.save(new User("Krishna Sharma", "krishna@retail.com", "pass123", Role.SHOPKEEPER, "+91 98450 77889"));
        User managerUser = userRepository.save(new User("Rajesh Kumar (Supermarket Manager)", "manager@retail.com", "pass123", Role.SUPERMARKET_MANAGER, "+91 98450 77112"));
        User adminUser = userRepository.save(new User("Vikramaditya (Supermarket Admin)", "admin@retail.com", "pass123", Role.ADMIN, "+91 99001 22334"));

        // 2. Seed Stores
        Store supermarket = new Store("FreshMart Supermarket", StoreType.SUPERMARKET, managerUser.getFullName(), "100 Feet Rd, Indiranagar, Bengaluru", "+91 80 1234 5678");
        supermarket.setOwner(managerUser);
        supermarket.setCity("Bengaluru");
        supermarket.setState("Karnataka");
        supermarket.setPincode("560038");
        supermarket.setEmail("contact@freshmart.in");
        supermarket.setDescription("Premier multi-aisle hypermarket featuring fresh daily essentials, groceries, dairy, and household goods.");
        supermarket = storeRepository.save(supermarket);

        Store kiranaStore = new Store("Gupta Kirana & Provision Store", StoreType.KIRANA_STORE, shopkeeperUser.getFullName(), "Shop #14, Main Bazaar, 5th Cross, Bengaluru", "+91 98230 55443");
        kiranaStore.setOwner(shopkeeperUser);
        kiranaStore.setCity("Bengaluru");
        kiranaStore.setState("Karnataka");
        kiranaStore.setPincode("560001");
        kiranaStore.setEmail("guptakirana@gmail.com");
        kiranaStore.setDescription("Neighborhood grocery and daily provisions store serving daily fresh milk, atta, spices, and staples.");
        kiranaStore = storeRepository.save(kiranaStore);

        Store harshStore = new Store("Harsh Kirana Store", StoreType.KIRANA_STORE, harshUser.getFullName(), "Market Complex, Shop #8, Bengaluru", "+91 98111 22334");
        harshStore.setOwner(harshUser);
        harshStore.setCity("Bengaluru");
        harshStore.setState("Karnataka");
        harshStore.setPincode("560025");
        harshStore.setEmail("harsh@retail.com");
        harshStore.setDescription("Harsh Kirana Store offering daily groceries, personal care, and staples.");
        harshStore = storeRepository.save(harshStore);

        Store patelStore = new Store("Patel General Store", StoreType.KIRANA_STORE, patelUser.getFullName(), "Station Road, Sector 3, Bengaluru", "+91 98221 44556");
        patelStore.setOwner(patelUser);
        patelStore.setCity("Bengaluru");
        patelStore.setState("Karnataka");
        patelStore.setPincode("560034");
        patelStore.setEmail("patel@retail.com");
        patelStore.setDescription("Patel General Store with daily home essentials and personal care items.");
        patelStore = storeRepository.save(patelStore);

        Store krishnaStore = new Store("Krishna Mart", StoreType.KIRANA_STORE, krishnaUser.getFullName(), "Main Bazaar, Shop 12, Bengaluru", "+91 98450 77889");
        krishnaStore.setOwner(krishnaUser);
        krishnaStore.setCity("Bengaluru");
        krishnaStore.setState("Karnataka");
        krishnaStore.setPincode("560040");
        krishnaStore.setEmail("krishna@retail.com");
        krishnaStore.setDescription("Krishna Mart daily neighborhood essentials and cosmetics.");
        krishnaStore = storeRepository.save(krishnaStore);

        // 3. Seed Sections (for Supermarket)
        Section s1 = sectionRepository.save(new Section("Grocery & Staples", "SEC-GROCERY", "Ground Floor - East Wing", "Daily grains, flours, pulses, cooking oils, and spices"));
        Section s2 = sectionRepository.save(new Section("Dairy & Chilled Foods", "SEC-DAIRY", "Ground Floor - North Cooler", "Refrigerated dairy, milk, paneer, and butter"));
        Section s3 = sectionRepository.save(new Section("Packaged Snacks & Beverages", "SEC-SNACKS", "First Floor - Central Hall", "Biscuits, noodles, instant coffee, juices, and confectionery"));
        Section s4 = sectionRepository.save(new Section("Personal Care & Hygiene", "SEC-PERSONAL", "First Floor - West Wing", "Soaps, shampoos, oral care, and skin wellness"));
        Section s5 = sectionRepository.save(new Section("Household & Cleaning", "SEC-HOUSEHOLD", "Ground Floor - Rear Aisle", "Laundry detergents, dishwash, cleaners, and paper products"));

        // 4. Seed Aisles
        Aisle a1 = aisleRepository.save(new Aisle(s1.getId(), s1.getName(), "Aisle 1", "Shelf A1-A3", "Atta, Rice & Whole Grains"));
        Aisle a2 = aisleRepository.save(new Aisle(s1.getId(), s1.getName(), "Aisle 2", "Shelf B1-B3", "Dals, Pulses, Cooking Oils & Spices"));
        Aisle a3 = aisleRepository.save(new Aisle(s2.getId(), s2.getName(), "Aisle 3", "Cooler Shelf C1-C2", "Fresh Milk, Curd, Butter & Cheese"));
        Aisle a4 = aisleRepository.save(new Aisle(s2.getId(), s2.getName(), "Aisle 4", "Cooler Shelf C3-C4", "Paneer, Flavored Milk & Plant Drinks"));
        Aisle a5 = aisleRepository.save(new Aisle(s3.getId(), s3.getName(), "Aisle 5", "Shelf D1-D3", "Biscuits, Noodles, Snacks & Sweets"));
        Aisle a6 = aisleRepository.save(new Aisle(s3.getId(), s3.getName(), "Aisle 6", "Shelf E1-E2", "Tea, Coffee, Juices & Health Drinks"));
        Aisle a7 = aisleRepository.save(new Aisle(s4.getId(), s4.getName(), "Aisle 7", "Shelf F1-F3", "Bathing Soaps, Body Wash & Shampoos"));
        Aisle a8 = aisleRepository.save(new Aisle(s4.getId(), s4.getName(), "Aisle 8", "Shelf G1-G2", "Toothpastes, Brushes & Skin Lotions"));
        Aisle a9 = aisleRepository.save(new Aisle(s5.getId(), s5.getName(), "Aisle 9", "Shelf H1-H2", "Liquid Detergents, Surface & Dish Cleaners"));

        // 5. Seed Categories
        Category catStaples = categoryRepository.save(new Category("Staples & Grains", "Wheat"));
        Category catDairy = categoryRepository.save(new Category("Dairy & Eggs", "Milk"));
        Category catOils = categoryRepository.save(new Category("Oils & Masalas", "Flame"));
        Category catSnacks = categoryRepository.save(new Category("Snacks & Instant Food", "Cookie"));
        Category catBeverages = categoryRepository.save(new Category("Beverages", "Coffee"));
        Category catPersonal = categoryRepository.save(new Category("Personal Care", "Sparkles"));
        Category catHousehold = categoryRepository.save(new Category("Household Essentials", "Home"));

        // 6. Seed Suppliers
        Supplier sup1 = supplierRepository.save(new Supplier("Metro Agri Logistics", "Ramesh Sharma", "+91 98230 11234", "orders@metroagri.in", "Staples & Grains"));
        Supplier sup2 = supplierRepository.save(new Supplier("Amul Fresh Direct", "Kavita Patel", "+91 98450 88219", "supply@amuldistributors.com", "Dairy & Eggs"));
        Supplier sup3 = supplierRepository.save(new Supplier("ITC & Nestle Consumer Hub", "Deepak Verma", "+91 99100 44321", "logistics@fmcgdirect.in", "Snacks & Beverages"));
        Supplier sup4 = supplierRepository.save(new Supplier("Hindustan Consumer Supply", "Ananya Iyer", "+91 97312 65432", "care@hcsdistributors.com", "Personal Care & Household"));

        // 7. Seed Global Products Catalog
        // Dairy & Bakery
        Product pMilkAmul = productRepository.save(new Product("Amul Taaza Milk 500ml", "Amul", "Homogenised toned milk with 3.0% fat and 8.5% SNF", "890103001104", "https://images.openfoodfacts.org/images/products/890/126/201/0016/front_en.53.400.jpg", catDairy));
        Product pMilkMother = productRepository.save(new Product("Mother Dairy Milk 500ml", "Mother Dairy", "Pasteurized homogenized full cream rich milk", "890103001120", "https://images.openfoodfacts.org/images/products/890/164/800/1004/front_en.4.400.jpg", catDairy));
        Product pButterAmul = productRepository.save(new Product("Amul Butter 100g", "Amul", "Pasteurised creamy salted butter made from pure milk", "890103001105", "https://ik.imagekit.io/wlfr/wellness/images/products/amul-butter-pasteurised-100-g-0-20210217.jpg", catDairy));
        Product pCurdAmul = productRepository.save(new Product("Amul Curd 400g", "Amul", "Thick and delicious pasteurized Masti Dahi cup", "890103001121", "https://images.openfoodfacts.org/images/products/890/126/203/0083/front_en.11.400.jpg", catDairy));
        Product pCheeseAmul = productRepository.save(new Product("Amul Cheese 200g", "Amul", "Rich processed cheddar cheese block for cooking", "890103001122", "https://images.openfoodfacts.org/images/products/890/126/202/0039/front_en.28.400.jpg", catDairy));
        Product pBreadBritannia = productRepository.save(new Product("Britannia Bread 400g", "Britannia", "100% whole wheat nutrient-rich soft brown bread", "890103001123", "https://images.openfoodfacts.org/images/products/890/106/301/4479/front_en.4.400.jpg", catDairy));

        // Rice, Grains & Atta
        Product pAttaAashirvaad = productRepository.save(new Product("Aashirvaad Atta 5kg", "Aashirvaad", "100% pure whole wheat grain flour enriched with dietary fiber", "890103001101", "https://images.openfoodfacts.org/images/products/890/103/001/1018/front_en.22.400.jpg", catStaples));
        Product pAttaFortune = productRepository.save(new Product("Fortune Chakki Fresh Atta 5kg", "Fortune", "Chakki ground stone-milled wholesome wheat flour", "890103001124", "https://images.openfoodfacts.org/images/products/890/600/728/0023/front_en.12.400.jpg", catStaples));
        Product pRiceIndiaGate = productRepository.save(new Product("India Gate Basmati Rice 5kg", "India Gate", "Aged long grain premium fragrant basmati rice", "890103001125", "https://images.openfoodfacts.org/images/products/069/022/510/1103/front_en.9.400.jpg", catStaples));
        Product pRiceDaawat = productRepository.save(new Product("Daawat Basmati Rice 5kg", "Daawat", "Super elongated slender aromatic basmati grains", "890103001126", "https://images.openfoodfacts.org/images/products/890/153/700/6011/front_en.8.400.jpg", catStaples));
        Product pSaltTata = productRepository.save(new Product("Tata Salt 1kg", "Tata", "Vacuum evaporated iodized salt with essential iodine", "890103001103", "https://images.openfoodfacts.org/images/products/890/103/001/1032/front_en.24.400.jpg", catStaples));

        // Pulses & Dals
        Product pDalToor = productRepository.save(new Product("Toor Dal 1kg", "Tata Sampann", "Unpolished protein-rich arhar / toor dal", "890103001127", "https://images.openfoodfacts.org/images/products/890/404/390/1070/front_en.16.400.jpg", catStaples));
        Product pDalMoong = productRepository.save(new Product("Moong Dal 1kg", "Tata Sampann", "Unpolished split yellow moong lentils", "890103001128", "https://images.openfoodfacts.org/images/products/890/404/390/1094/front_en.15.400.jpg", catStaples));
        Product pDalMasoor = productRepository.save(new Product("Masoor Dal 1kg", "Tata Sampann", "Unpolished whole red masoor lentils", "890103001129", "https://images.openfoodfacts.org/images/products/890/404/390/1117/front_en.14.400.jpg", catStaples));
        Product pDalChana = productRepository.save(new Product("Chana Dal 1kg", "Tata Sampann", "Unpolished premium split bengal gram lentils", "890103001130", "https://images.openfoodfacts.org/images/products/890/404/390/1087/front_en.15.400.jpg", catStaples));

        // Cooking Oils
        Product pOilFortune = productRepository.save(new Product("Fortune Sunflower Oil 1L", "Fortune", "Refined light sunflower cooking oil with Vitamin E", "890103001102", "https://images.openfoodfacts.org/images/products/890/600/728/0115/front_en.15.400.jpg", catOils));
        Product pOilSaffola = productRepository.save(new Product("Saffola Gold Oil 1L", "Saffola", "Blended edible oil with Oryzanol and heart care lipids", "890103001131", "https://images.openfoodfacts.org/images/products/890/108/800/1023/front_en.20.400.jpg", catOils));
        Product pOilMustard = productRepository.save(new Product("Fortune Mustard Oil 1L", "Fortune", "Kachi Ghani pure cold pressed pungent mustard oil", "890103001132", "https://images.openfoodfacts.org/images/products/890/600/728/0139/front_en.14.400.jpg", catOils));

        // Snacks & Biscuits
        Product pNoodlesMaggi = productRepository.save(new Product("Maggi 2-Minute Noodles 70g", "Nestle", "Classic Indian masala instant noodles fortified with iron", "890103001106", "https://images.openfoodfacts.org/images/products/890/105/885/2228/front_en.36.400.jpg", catSnacks));
        Product pBiscuitsParleG = productRepository.save(new Product("Parle-G Biscuits 800g", "Parle", "Iconic golden glucose biscuits with milk and wheat goodness", "890103001110", "https://images.openfoodfacts.org/images/products/890/171/910/1039/front_en.12.400.jpg", catSnacks));
        Product pBiscuitsGoodDay = productRepository.save(new Product("Britannia Good Day Biscuits 200g", "Britannia", "Rich buttery cookies with cashew and almond essence", "890103001133", "https://images.openfoodfacts.org/images/products/890/106/301/2147/front_en.24.400.jpg", catSnacks));
        Product pChipsLays = productRepository.save(new Product("Lays Classic Salted 50g", "Lay's", "Crispy potato chips seasoned with natural rock salt", "890103001134", "https://images.openfoodfacts.org/images/products/890/149/110/1010/front_en.18.400.jpg", catSnacks));
        Product pSnackKurkure = productRepository.save(new Product("Kurkure Masala Munch", "Kurkure", "Crunchy spicy puffed corn and rice curls", "890103001135", "https://images.openfoodfacts.org/images/products/890/149/150/1018/front_en.23.400.jpg", catSnacks));
        Product pSnackBingo = productRepository.save(new Product("Bingo Mad Angles", "Bingo", "Triangle shaped crispy spicy corn chips", "890103001136", "https://images.openfoodfacts.org/images/products/890/172/513/1013/front_en.18.400.jpg", catSnacks));
        Product pSnackHaldiram = productRepository.save(new Product("Haldiram's Bhujia", "Haldiram's", "Crispy fried spiced gram flour and potato bhujia sev", "890103001137", "https://images.openfoodfacts.org/images/products/890/400/440/1014/front_en.22.400.jpg", catSnacks));
        Product pBiscuitsOreo = productRepository.save(new Product("Oreo", "Cadbury", "Rich dark chocolate cookie sandwich with sweet vanilla cream", "890103001138", "https://images.openfoodfacts.org/images/products/762/221/045/0013/front_en.29.400.jpg", catSnacks));
        Product pBiscuitsMarie = productRepository.save(new Product("Marie Gold", "Britannia", "Crisp light semi-sweet tea time biscuits", "890103001139", "https://images.openfoodfacts.org/images/products/890/106/301/1010/front_en.25.400.jpg", catSnacks));
        Product pBiscuitsHideSeek = productRepository.save(new Product("Hide & Seek", "Parle", "Crispy chocolate cookies loaded with rich choco chips", "890103001140", "https://images.openfoodfacts.org/images/products/890/171/910/3019/front_en.21.400.jpg", catSnacks));

        // Beverages
        Product pTeaTata = productRepository.save(new Product("Tata Tea 250g", "Tata Tea", "Rich aromatic blended Assam tea leaves with gentle aroma", "890103001109", "https://images.openfoodfacts.org/images/products/890/103/001/1094/front_en.19.400.jpg", catBeverages));
        Product pCoke = productRepository.save(new Product("Coca-Cola 750ml", "Coca-Cola", "Refreshing carbonated cola beverage with crisp fizz", "890103001141", "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.44.400.jpg", catBeverages));
        Product pThumsUp = productRepository.save(new Product("Thums Up 750ml", "Thums Up", "Charged strong spicy carbonated cola drink", "890103001142", "https://images.openfoodfacts.org/images/products/890/176/401/1017/front_en.19.400.jpg", catBeverages));
        Product pSprite = productRepository.save(new Product("Sprite 750ml", "Sprite", "Clear sparkling lemon-lime flavored soft drink", "890103001143", "https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.38.400.jpg", catBeverages));
        Product pPepsi = productRepository.save(new Product("Pepsi", "Pepsi", "Bold refreshing chilled cola soft drink bottle", "890103001144", "https://images.openfoodfacts.org/images/products/001/200/000/0133/front_en.34.400.jpg", catBeverages));
        Product pJuiceReal = productRepository.save(new Product("Real Fruit Juice", "Real", "100% natural pure mixed fruit juice with no added sugar", "890103001145", "https://images.openfoodfacts.org/images/products/890/120/701/1018/front_en.19.400.jpg", catBeverages));

        // Personal Care
        Product pToothpasteColgate = productRepository.save(new Product("Colgate Toothpaste 200g", "Colgate", "Strong teeth calcium cavity protection toothpaste", "890103001146", "https://images.openfoodfacts.org/images/products/890/131/401/0018/front_en.27.400.jpg", catPersonal));
        Product pSoapLux = productRepository.save(new Product("Lux Soap 100g", "Lux", "Velvet touch moisturizing jasmine bathing soap bar", "890103001147", "https://images.openfoodfacts.org/images/products/890/103/038/1012/front_en.17.400.jpg", catPersonal));
        Product pSoapDove = productRepository.save(new Product("Dove Soap 100g", "Dove", "1/4th moisturizing cream beauty cleansing bar", "890103001148", "https://images.openfoodfacts.org/images/products/871/716/366/1239/front_en.23.400.jpg", catPersonal));
        Product pSoapDettol = productRepository.save(new Product("Dettol Original Germ Protection Bathing Soap", "Dettol", "Antibacterial pine fragrance bathing bar for family hygiene", "890103001107", "https://images.openfoodfacts.org/images/products/890/139/600/1010/front_en.21.400.jpg", catPersonal));
        Product pHandwashDettol = productRepository.save(new Product("Dettol Handwash 250ml", "Dettol", "Liquid germ protection handwash with moisture pump", "890103001149", "https://images.openfoodfacts.org/images/products/890/139/600/2017/front_en.19.400.jpg", catPersonal));
        Product pShampooDove = productRepository.save(new Product("Dove Daily Moisture Shampoo with Pro-Moisture Complex", "Dove", "Nourishing shampoo for smooth, soft and manageable hair", "890103001113", "https://images.openfoodfacts.org/images/products/871/716/373/1239/front_en.16.400.jpg", catPersonal));
        Product pShampooHeadShoulders = productRepository.save(new Product("Head & Shoulders Shampoo", "Head & Shoulders", "Smooth and silky anti-dandruff daily shampoo 340ml", "890103001150", "https://images.openfoodfacts.org/images/products/401/560/066/1234/front_en.18.400.jpg", catPersonal));

        // Household & Cleaning
        Product pSurfExcel = productRepository.save(new Product("Surf Excel Matic 1kg", "Surf Excel", "Superior stain removal powder suitable for bucket and machine wash", "890103001108", "https://images.openfoodfacts.org/images/products/890/103/058/1016/front_en.15.400.jpg", catHousehold));
        Product pAriel = productRepository.save(new Product("Ariel Detergent", "Ariel", "Complete Matic front and top load washing powder 1kg", "890103001151", "https://images.openfoodfacts.org/images/products/401/560/055/1016/front_en.14.400.jpg", catHousehold));
        Product pVim = productRepository.save(new Product("Vim Dishwash", "Vim", "Concentrated dishwash cleaning gel lemon 750ml", "890103001152", "https://images.openfoodfacts.org/images/products/890/103/065/1016/front_en.18.400.jpg", catHousehold));
        Product pHarpic = productRepository.save(new Product("Harpic Toilet Cleaner", "Harpic", "Power Plus original disinfectant toilet bowl cleaner 750ml", "890103001153", "https://images.openfoodfacts.org/images/products/890/139/601/1019/front_en.16.400.jpg", catHousehold));
        Product pLizol = productRepository.save(new Product("Lizol Floor Cleaner", "Lizol", "Disinfectant surface and floor cleaner citrus liquid 1L", "890103001154", "https://images.openfoodfacts.org/images/products/890/139/602/1018/front_en.17.400.jpg", catHousehold));


        // 8. Seed StoreProducts for Store 1 (Harsh Kirana Store)
        seedStoreProduct(harshStore, pMilkAmul, 32.0, 34.0, 500.0, ProductUnit.ML, 20, 5, "Aisle 3", "Row 1", "Shelf 1", "Dairy & Chilled Foods");
        seedStoreProduct(harshStore, pButterAmul, 56.0, 58.0, 100.0, ProductUnit.GRAM, 15, 4, "Aisle 3", "Row 1", "Shelf 2", "Dairy & Chilled Foods");
        seedStoreProduct(harshStore, pAttaAashirvaad, 245.0, 270.0, 5.0, ProductUnit.KG, 30, 8, "Aisle 1", "Row 1", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(harshStore, pSaltTata, 28.0, 30.0, 1.0, ProductUnit.KG, 25, 6, "Aisle 1", "Row 2", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(harshStore, pBiscuitsParleG, 85.0, 95.0, 800.0, ProductUnit.GRAM, 28, 5, "Aisle 5", "Row 1", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(harshStore, pNoodlesMaggi, 14.0, 15.0, 70.0, ProductUnit.GRAM, 45, 10, "Aisle 5", "Row 2", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(harshStore, pOilFortune, 148.0, 160.0, 1.0, ProductUnit.LITRE, 18, 5, "Aisle 2", "Row 1", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(harshStore, pBreadBritannia, 48.0, 50.0, 400.0, ProductUnit.GRAM, 14, 4, "Aisle 3", "Row 2", "Shelf 1", "Dairy & Chilled Foods");
        seedStoreProduct(harshStore, pCoke, 40.0, 40.0, 750.0, ProductUnit.ML, 24, 6, "Aisle 6", "Row 1", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(harshStore, pSurfExcel, 140.0, 155.0, 1.0, ProductUnit.KG, 16, 4, "Aisle 9", "Row 1", "Shelf 1", "Household & Cleaning");
        seedStoreProduct(harshStore, pToothpasteColgate, 115.0, 125.0, 200.0, ProductUnit.GRAM, 20, 5, "Aisle 8", "Row 1", "Shelf 1", "Personal Care & Hygiene");
        seedStoreProduct(harshStore, pSoapLux, 36.0, 40.0, 100.0, ProductUnit.GRAM, 30, 8, "Aisle 7", "Row 1", "Shelf 1", "Personal Care & Hygiene");
        seedStoreProduct(harshStore, pHandwashDettol, 95.0, 105.0, 250.0, ProductUnit.ML, 18, 4, "Aisle 7", "Row 2", "Shelf 1", "Personal Care & Hygiene");
        seedStoreProduct(harshStore, pTeaTata, 135.0, 150.0, 250.0, ProductUnit.GRAM, 22, 5, "Aisle 6", "Row 2", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(harshStore, pThumsUp, 40.0, 40.0, 750.0, ProductUnit.ML, 20, 5, "Aisle 6", "Row 1", "Shelf 2", "Packaged Snacks & Beverages");
        seedStoreProduct(harshStore, pShampooDove, 249.0, 280.0, 340.0, ProductUnit.ML, 25, 6, "Aisle 5", "Row 7", "Shelf 2", "Personal Care & Hygiene");


        // 9. Seed StoreProducts for Store 2 (Gupta Kirana & Provision Store)
        seedStoreProduct(kiranaStore, pMilkMother, 33.0, 35.0, 500.0, ProductUnit.ML, 16, 4, "Aisle 1", "Row 1", "Shelf 1", "Dairy & Milk");
        seedStoreProduct(kiranaStore, pCurdAmul, 35.0, 38.0, 400.0, ProductUnit.GRAM, 14, 4, "Aisle 1", "Row 1", "Shelf 2", "Dairy & Milk");
        seedStoreProduct(kiranaStore, pRiceIndiaGate, 450.0, 490.0, 5.0, ProductUnit.KG, 12, 3, "Aisle 2", "Row 1", "Shelf 1", "Rice & Staples");
        seedStoreProduct(kiranaStore, pSaltTata, 28.0, 30.0, 1.0, ProductUnit.KG, 30, 8, "Aisle 2", "Row 2", "Shelf 1", "Rice & Staples");
        seedStoreProduct(kiranaStore, pBiscuitsGoodDay, 38.0, 42.0, 200.0, ProductUnit.GRAM, 22, 5, "Aisle 3", "Row 1", "Shelf 1", "Biscuits & Snacks");
        seedStoreProduct(kiranaStore, pBiscuitsParleG, 88.0, 95.0, 800.0, ProductUnit.GRAM, 25, 5, "Aisle 3", "Row 1", "Shelf 2", "Biscuits & Snacks");
        seedStoreProduct(kiranaStore, pOilFortune, 150.0, 160.0, 1.0, ProductUnit.LITRE, 15, 4, "Aisle 2", "Row 3", "Shelf 1", "Oils & Masalas");
        seedStoreProduct(kiranaStore, pSurfExcel, 145.0, 155.0, 1.0, ProductUnit.KG, 14, 4, "Aisle 4", "Row 1", "Shelf 1", "Cleaning & Detergents");
        seedStoreProduct(kiranaStore, pToothpasteColgate, 118.0, 125.0, 200.0, ProductUnit.GRAM, 18, 5, "Aisle 4", "Row 2", "Shelf 1", "Personal Care");
        seedStoreProduct(kiranaStore, pHandwashDettol, 98.0, 105.0, 250.0, ProductUnit.ML, 15, 4, "Aisle 4", "Row 2", "Shelf 2", "Personal Care");
        seedStoreProduct(kiranaStore, pSoapLux, 38.0, 40.0, 100.0, ProductUnit.GRAM, 24, 6, "Aisle 4", "Row 3", "Shelf 1", "Personal Care");
        seedStoreProduct(kiranaStore, pSoapDove, 58.0, 65.0, 100.0, ProductUnit.GRAM, 20, 5, "Aisle 4", "Row 3", "Shelf 2", "Personal Care");
        seedStoreProduct(kiranaStore, pNoodlesMaggi, 14.0, 15.0, 70.0, ProductUnit.GRAM, 40, 10, "Aisle 3", "Row 2", "Shelf 1", "Biscuits & Snacks");
        seedStoreProduct(kiranaStore, pCoke, 40.0, 40.0, 750.0, ProductUnit.ML, 18, 4, "Aisle 3", "Row 3", "Shelf 1", "Beverages");
        seedStoreProduct(kiranaStore, pTeaTata, 138.0, 150.0, 250.0, ProductUnit.GRAM, 16, 4, "Aisle 2", "Row 4", "Shelf 1", "Beverages");
        seedStoreProduct(kiranaStore, pAttaAashirvaad, 255.0, 270.0, 5.0, ProductUnit.KG, 12, 4, "Aisle 2", "Row 1", "Shelf 2", "Rice & Staples");
        seedStoreProduct(kiranaStore, pShampooDove, 250.0, 280.0, 340.0, ProductUnit.ML, 18, 5, "Aisle 1", "Row 3", "Shelf 1", "Personal Care");


        // 10. Seed StoreProducts for Store 3 (Patel General Store)
        seedStoreProduct(patelStore, pMilkAmul, 33.0, 34.0, 500.0, ProductUnit.ML, 15, 4, "Aisle 1", "Row 1", "Shelf 1", "Dairy & Eggs");
        seedStoreProduct(patelStore, pButterAmul, 57.0, 58.0, 100.0, ProductUnit.GRAM, 12, 3, "Aisle 1", "Row 1", "Shelf 2", "Dairy & Eggs");
        seedStoreProduct(patelStore, pOilFortune, 149.0, 160.0, 1.0, ProductUnit.LITRE, 20, 5, "Aisle 2", "Row 1", "Shelf 1", "Oils & Masalas");
        seedStoreProduct(patelStore, pAttaAashirvaad, 248.0, 270.0, 5.0, ProductUnit.KG, 22, 6, "Aisle 2", "Row 2", "Shelf 1", "Staples & Grains");
        seedStoreProduct(patelStore, pSaltTata, 28.0, 30.0, 1.0, ProductUnit.KG, 35, 8, "Aisle 2", "Row 2", "Shelf 2", "Staples & Grains");
        seedStoreProduct(patelStore, pNoodlesMaggi, 14.0, 15.0, 70.0, ProductUnit.GRAM, 50, 12, "Aisle 3", "Row 1", "Shelf 1", "Snacks & Instant Food");
        seedStoreProduct(patelStore, pBiscuitsParleG, 86.0, 95.0, 800.0, ProductUnit.GRAM, 30, 6, "Aisle 3", "Row 1", "Shelf 2", "Snacks & Instant Food");
        seedStoreProduct(patelStore, pBreadBritannia, 49.0, 50.0, 400.0, ProductUnit.GRAM, 12, 4, "Aisle 1", "Row 2", "Shelf 1", "Dairy & Eggs");
        seedStoreProduct(patelStore, pSoapLux, 37.0, 40.0, 100.0, ProductUnit.GRAM, 25, 5, "Aisle 4", "Row 1", "Shelf 1", "Personal Care");
        seedStoreProduct(patelStore, pSoapDove, 59.0, 65.0, 100.0, ProductUnit.GRAM, 18, 4, "Aisle 4", "Row 1", "Shelf 2", "Personal Care");
        seedStoreProduct(patelStore, pToothpasteColgate, 116.0, 125.0, 200.0, ProductUnit.GRAM, 22, 5, "Aisle 4", "Row 2", "Shelf 1", "Personal Care");
        seedStoreProduct(patelStore, pHandwashDettol, 96.0, 105.0, 250.0, ProductUnit.ML, 16, 4, "Aisle 4", "Row 2", "Shelf 2", "Personal Care");
        seedStoreProduct(patelStore, pThumsUp, 40.0, 40.0, 750.0, ProductUnit.ML, 25, 6, "Aisle 5", "Row 1", "Shelf 1", "Beverages");
        seedStoreProduct(patelStore, pSprite, 40.0, 40.0, 750.0, ProductUnit.ML, 20, 5, "Aisle 5", "Row 1", "Shelf 2", "Beverages");
        seedStoreProduct(patelStore, pTeaTata, 136.0, 150.0, 250.0, ProductUnit.GRAM, 18, 4, "Aisle 5", "Row 2", "Shelf 1", "Beverages");
        seedStoreProduct(patelStore, pShampooDove, 249.0, 280.0, 340.0, ProductUnit.ML, 20, 5, "Aisle 5", "Row 7", "Shelf 2", "Personal Care & Hygiene");


        // 11. Seed StoreProducts for Store 4 (Krishna Mart)
        // Dairy
        seedStoreProduct(krishnaStore, pMilkAmul, 31.0, 34.0, 500.0, ProductUnit.ML, 25, 6, "Aisle 1", "Row 1", "Shelf 1", "Dairy & Eggs");
        seedStoreProduct(krishnaStore, pButterAmul, 55.0, 58.0, 100.0, ProductUnit.GRAM, 18, 4, "Aisle 1", "Row 1", "Shelf 2", "Dairy & Eggs");
        seedStoreProduct(krishnaStore, pCurdAmul, 34.0, 38.0, 400.0, ProductUnit.GRAM, 20, 5, "Aisle 1", "Row 2", "Shelf 1", "Dairy & Eggs");
        seedStoreProduct(krishnaStore, pCheeseAmul, 125.0, 135.0, 200.0, ProductUnit.GRAM, 15, 3, "Aisle 1", "Row 2", "Shelf 2", "Dairy & Eggs");
        // Grocery
        seedStoreProduct(krishnaStore, pAttaAashirvaad, 244.0, 270.0, 5.0, ProductUnit.KG, 35, 8, "Aisle 2", "Row 1", "Shelf 1", "Staples & Grains");
        seedStoreProduct(krishnaStore, pRiceIndiaGate, 445.0, 490.0, 5.0, ProductUnit.KG, 20, 4, "Aisle 2", "Row 1", "Shelf 2", "Staples & Grains");
        seedStoreProduct(krishnaStore, pSaltTata, 27.0, 30.0, 1.0, ProductUnit.KG, 40, 10, "Aisle 2", "Row 2", "Shelf 1", "Staples & Grains");
        seedStoreProduct(krishnaStore, pOilFortune, 147.0, 160.0, 1.0, ProductUnit.LITRE, 25, 6, "Aisle 2", "Row 3", "Shelf 1", "Oils & Masalas");
        seedStoreProduct(krishnaStore, pDalToor, 158.0, 175.0, 1.0, ProductUnit.KG, 22, 5, "Aisle 2", "Row 4", "Shelf 1", "Staples & Grains");
        seedStoreProduct(krishnaStore, pTeaTata, 134.0, 150.0, 250.0, ProductUnit.GRAM, 20, 4, "Aisle 2", "Row 5", "Shelf 1", "Beverages");
        // Snacks
        seedStoreProduct(krishnaStore, pBiscuitsParleG, 84.0, 95.0, 800.0, ProductUnit.GRAM, 35, 8, "Aisle 3", "Row 1", "Shelf 1", "Snacks & Instant Food");
        seedStoreProduct(krishnaStore, pBiscuitsGoodDay, 37.0, 42.0, 200.0, ProductUnit.GRAM, 28, 6, "Aisle 3", "Row 1", "Shelf 2", "Snacks & Instant Food");
        seedStoreProduct(krishnaStore, pChipsLays, 19.0, 20.0, 50.0, ProductUnit.GRAM, 30, 8, "Aisle 3", "Row 2", "Shelf 1", "Snacks & Instant Food");
        seedStoreProduct(krishnaStore, pNoodlesMaggi, 14.0, 15.0, 70.0, ProductUnit.GRAM, 50, 12, "Aisle 3", "Row 2", "Shelf 2", "Snacks & Instant Food");
        // Beverages
        seedStoreProduct(krishnaStore, pCoke, 39.0, 40.0, 750.0, ProductUnit.ML, 25, 6, "Aisle 4", "Row 1", "Shelf 1", "Beverages");
        seedStoreProduct(krishnaStore, pThumsUp, 39.0, 40.0, 750.0, ProductUnit.ML, 25, 6, "Aisle 4", "Row 1", "Shelf 2", "Beverages");
        seedStoreProduct(krishnaStore, pSprite, 39.0, 40.0, 750.0, ProductUnit.ML, 20, 5, "Aisle 4", "Row 2", "Shelf 1", "Beverages");
        // Personal Care
        seedStoreProduct(krishnaStore, pToothpasteColgate, 114.0, 125.0, 200.0, ProductUnit.GRAM, 25, 5, "Aisle 5", "Row 1", "Shelf 1", "Personal Care");
        seedStoreProduct(krishnaStore, pSoapDove, 57.0, 65.0, 100.0, ProductUnit.GRAM, 22, 5, "Aisle 5", "Row 1", "Shelf 2", "Personal Care");
        seedStoreProduct(krishnaStore, pHandwashDettol, 94.0, 105.0, 250.0, ProductUnit.ML, 20, 4, "Aisle 5", "Row 2", "Shelf 1", "Personal Care");
        seedStoreProduct(krishnaStore, pShampooDove, 255.0, 280.0, 340.0, ProductUnit.ML, 15, 4, "Aisle 2", "Row 4", "Shelf 1", "Personal Care");


        // 12. Seed StoreProducts for Store 5 (FreshMart Supermarket)
        // Dairy
        seedStoreProduct(supermarket, pMilkAmul, 30.0, 34.0, 500.0, ProductUnit.ML, 50, 15, "Aisle 3", "Row 1", "Shelf 1", "Dairy & Chilled Foods");
        seedStoreProduct(supermarket, pButterAmul, 54.0, 58.0, 100.0, ProductUnit.GRAM, 35, 10, "Aisle 3", "Row 1", "Shelf 2", "Dairy & Chilled Foods");
        seedStoreProduct(supermarket, pCheeseAmul, 120.0, 135.0, 200.0, ProductUnit.GRAM, 30, 8, "Aisle 3", "Row 2", "Shelf 1", "Dairy & Chilled Foods");
        seedStoreProduct(supermarket, pCurdAmul, 33.0, 38.0, 400.0, ProductUnit.GRAM, 40, 12, "Aisle 3", "Row 2", "Shelf 2", "Dairy & Chilled Foods");
        seedStoreProduct(supermarket, pMilkMother, 32.0, 35.0, 500.0, ProductUnit.ML, 35, 10, "Aisle 3", "Row 3", "Shelf 1", "Dairy & Chilled Foods");

        // Rice & Grains
        seedStoreProduct(supermarket, pRiceIndiaGate, 440.0, 490.0, 5.0, ProductUnit.KG, 45, 10, "Aisle 1", "Row 1", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(supermarket, pRiceDaawat, 460.0, 510.0, 5.0, ProductUnit.KG, 35, 8, "Aisle 1", "Row 1", "Shelf 2", "Grocery & Staples");
        seedStoreProduct(supermarket, pAttaAashirvaad, 240.0, 270.0, 5.0, ProductUnit.KG, 60, 15, "Aisle 1", "Row 2", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(supermarket, pAttaFortune, 235.0, 260.0, 5.0, ProductUnit.KG, 40, 10, "Aisle 1", "Row 2", "Shelf 2", "Grocery & Staples");
        seedStoreProduct(supermarket, pSaltTata, 26.0, 30.0, 1.0, ProductUnit.KG, 80, 20, "Aisle 1", "Row 3", "Shelf 1", "Grocery & Staples");

        // Pulses
        seedStoreProduct(supermarket, pDalToor, 155.0, 175.0, 1.0, ProductUnit.KG, 40, 10, "Aisle 2", "Row 1", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(supermarket, pDalMoong, 145.0, 160.0, 1.0, ProductUnit.KG, 35, 8, "Aisle 2", "Row 1", "Shelf 2", "Grocery & Staples");
        seedStoreProduct(supermarket, pDalMasoor, 130.0, 145.0, 1.0, ProductUnit.KG, 30, 8, "Aisle 2", "Row 2", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(supermarket, pDalChana, 120.0, 135.0, 1.0, ProductUnit.KG, 35, 8, "Aisle 2", "Row 2", "Shelf 2", "Grocery & Staples");

        // Cooking Oil
        seedStoreProduct(supermarket, pOilFortune, 145.0, 160.0, 1.0, ProductUnit.LITRE, 45, 12, "Aisle 2", "Row 3", "Shelf 1", "Grocery & Staples");
        seedStoreProduct(supermarket, pOilSaffola, 175.0, 195.0, 1.0, ProductUnit.LITRE, 30, 8, "Aisle 2", "Row 3", "Shelf 2", "Grocery & Staples");
        seedStoreProduct(supermarket, pOilMustard, 140.0, 155.0, 1.0, ProductUnit.LITRE, 25, 6, "Aisle 2", "Row 4", "Shelf 1", "Grocery & Staples");

        // Snacks
        seedStoreProduct(supermarket, pChipsLays, 18.0, 20.0, 50.0, ProductUnit.GRAM, 50, 15, "Aisle 5", "Row 1", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pSnackKurkure, 18.0, 20.0, 85.0, ProductUnit.GRAM, 45, 12, "Aisle 5", "Row 1", "Shelf 2", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pSnackBingo, 18.0, 20.0, 66.0, ProductUnit.GRAM, 40, 10, "Aisle 5", "Row 2", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pSnackHaldiram, 45.0, 50.0, 150.0, ProductUnit.GRAM, 35, 8, "Aisle 5", "Row 2", "Shelf 2", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pNoodlesMaggi, 13.5, 15.0, 70.0, ProductUnit.GRAM, 80, 20, "Aisle 5", "Row 3", "Shelf 1", "Packaged Snacks & Beverages");

        // Biscuits
        seedStoreProduct(supermarket, pBiscuitsParleG, 80.0, 95.0, 800.0, ProductUnit.GRAM, 50, 15, "Aisle 5", "Row 4", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pBiscuitsGoodDay, 35.0, 42.0, 200.0, ProductUnit.GRAM, 40, 10, "Aisle 5", "Row 4", "Shelf 2", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pBiscuitsOreo, 32.0, 35.0, 120.0, ProductUnit.GRAM, 35, 10, "Aisle 5", "Row 5", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pBiscuitsMarie, 32.0, 35.0, 250.0, ProductUnit.GRAM, 35, 8, "Aisle 5", "Row 5", "Shelf 2", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pBiscuitsHideSeek, 36.0, 40.0, 120.0, ProductUnit.GRAM, 30, 8, "Aisle 5", "Row 6", "Shelf 1", "Packaged Snacks & Beverages");

        // Beverages
        seedStoreProduct(supermarket, pCoke, 38.0, 40.0, 750.0, ProductUnit.ML, 45, 12, "Aisle 6", "Row 1", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pPepsi, 38.0, 40.0, 750.0, ProductUnit.ML, 40, 10, "Aisle 6", "Row 1", "Shelf 2", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pSprite, 38.0, 40.0, 750.0, ProductUnit.ML, 35, 10, "Aisle 6", "Row 2", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pThumsUp, 38.0, 40.0, 750.0, ProductUnit.ML, 45, 12, "Aisle 6", "Row 2", "Shelf 2", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pJuiceReal, 110.0, 125.0, 1.0, ProductUnit.LITRE, 30, 8, "Aisle 6", "Row 3", "Shelf 1", "Packaged Snacks & Beverages");
        seedStoreProduct(supermarket, pTeaTata, 130.0, 150.0, 250.0, ProductUnit.GRAM, 35, 8, "Aisle 6", "Row 4", "Shelf 1", "Packaged Snacks & Beverages");

        // Personal Care
        seedStoreProduct(supermarket, pToothpasteColgate, 110.0, 125.0, 200.0, ProductUnit.GRAM, 45, 10, "Aisle 8", "Row 1", "Shelf 1", "Personal Care & Hygiene");
        seedStoreProduct(supermarket, pSoapDove, 55.0, 65.0, 100.0, ProductUnit.GRAM, 40, 10, "Aisle 7", "Row 1", "Shelf 1", "Personal Care & Hygiene");
        seedStoreProduct(supermarket, pSoapLux, 35.0, 40.0, 100.0, ProductUnit.GRAM, 45, 12, "Aisle 7", "Row 1", "Shelf 2", "Personal Care & Hygiene");
        seedStoreProduct(supermarket, pSoapDettol, 145.0, 160.0, 4.0, ProductUnit.PIECE, 24, 8, "Aisle 7", "Row 2", "Shelf 1", "Personal Care & Hygiene");
        seedStoreProduct(supermarket, pHandwashDettol, 90.0, 105.0, 250.0, ProductUnit.ML, 35, 8, "Aisle 7", "Row 2", "Shelf 2", "Personal Care & Hygiene");
        seedStoreProduct(supermarket, pShampooHeadShoulders, 260.0, 290.0, 340.0, ProductUnit.ML, 25, 6, "Aisle 7", "Row 3", "Shelf 1", "Personal Care & Hygiene");
        seedStoreProduct(supermarket, pShampooDove, 240.0, 280.0, 340.0, ProductUnit.ML, 40, 10, "Aisle 5", "Row 7", "Shelf 2", "Personal Care & Hygiene");

        // Household
        seedStoreProduct(supermarket, pSurfExcel, 138.0, 155.0, 1.0, ProductUnit.KG, 40, 10, "Aisle 9", "Row 1", "Shelf 1", "Household & Cleaning");
        seedStoreProduct(supermarket, pAriel, 145.0, 165.0, 1.0, ProductUnit.KG, 30, 8, "Aisle 9", "Row 1", "Shelf 2", "Household & Cleaning");
        seedStoreProduct(supermarket, pVim, 95.0, 110.0, 750.0, ProductUnit.ML, 35, 8, "Aisle 9", "Row 2", "Shelf 1", "Household & Cleaning");
        seedStoreProduct(supermarket, pHarpic, 85.0, 95.0, 750.0, ProductUnit.ML, 35, 8, "Aisle 9", "Row 2", "Shelf 2", "Household & Cleaning");
        seedStoreProduct(supermarket, pLizol, 135.0, 150.0, 1.0, ProductUnit.LITRE, 30, 8, "Aisle 9", "Row 3", "Shelf 1", "Household & Cleaning");

        // 10. Seed Offers (Supermarket deals)
        StoreProduct sm_spAtta = storeProductRepository.findByStoreIdAndProductId(supermarket.getId(), pAttaAashirvaad.getId()).orElse(null);
        StoreProduct sm_spSurf = storeProductRepository.findByStoreIdAndProductId(supermarket.getId(), pSurfExcel.getId()).orElse(null);
        if (sm_spAtta != null) {
            offerRepository.save(new Offer(supermarket, sm_spAtta, "Weekend Staples Mega Saver", 225.0, 10));
        }
        if (sm_spSurf != null) {
            offerRepository.save(new Offer(supermarket, sm_spSurf, "Home Care Combo Discount", 125.0, 11));
        }

        // 11. Seed Sample Sales for Kirana Store
        StoreProduct k_spSalt = storeProductRepository.findByStoreIdAndProductId(kiranaStore.getId(), pSaltTata.getId()).orElse(null);
        StoreProduct k_spParle = storeProductRepository.findByStoreIdAndProductId(kiranaStore.getId(), pBiscuitsParleG.getId()).orElse(null);
        StoreProduct k_spAtta = storeProductRepository.findByStoreIdAndProductId(kiranaStore.getId(), pAttaAashirvaad.getId()).orElse(null);

        if (k_spSalt != null && k_spParle != null) {
            Sale sale1 = new Sale();
            sale1.setStore(kiranaStore);
            sale1.setCustomerName("Sunita Devi");
            sale1.setCustomerPhone("+91 98450 12345");
            sale1.setSaleDate(LocalDateTime.now().minusHours(2));
            SaleItem item1 = new SaleItem(k_spSalt, 2); // 2 x Tata Salt
            item1.setSale(sale1);
            sale1.getItems().add(item1);
            SaleItem item2 = new SaleItem(k_spParle, 3); // 3 x Parle-G
            item2.setSale(sale1);
            sale1.getItems().add(item2);
            sale1.recalculateTotal();
            saleRepository.save(sale1);
        }

        if (k_spAtta != null) {
            Sale sale2 = new Sale();
            sale2.setStore(kiranaStore);
            sale2.setCustomerName("Mohit Verma");
            sale2.setCustomerPhone("+91 97420 54321");
            sale2.setSaleDate(LocalDateTime.now().minusMinutes(45));
            SaleItem item3 = new SaleItem(k_spAtta, 1); // 1 x Atta 5kg
            item3.setSale(sale2);
            sale2.getItems().add(item3);
            sale2.recalculateTotal();
            saleRepository.save(sale2);
        }

        // 12. Seed Demand Logs
        StoreProduct sm_spButter = storeProductRepository.findByStoreIdAndProductId(supermarket.getId(), pButterAmul.getId()).orElse(null);
        if (sm_spButter != null) {
            demandLogRepository.save(new DemandLog(
                    pButterAmul.getName(),
                    sm_spButter.getId(),
                    "SEARCH_UNAVAILABLE",
                    14,
                    8,
                    812.0,
                    "Shoppers actively queried butter in Dairy section, but current shelf stock is low.",
                    "Procure 30 units emergency delivery from Amul Fresh Direct"
            ));
        }

        // 13. Seed Operational Issues
        operationalIssueRepository.save(new OperationalIssue(
                "Cooler #2 Temperature Anomaly",
                "Aisle 3 (Dairy Cooler)",
                "HIGH",
                "OPEN",
                "Morning Floor Supervisor",
                "Today, 08:30 AM",
                "Refrigeration unit showing +9°C instead of standard +4°C. Milk and curd crates temporarily shifted."
        ));

        operationalIssueRepository.save(new OperationalIssue(
                "Aisle 5 Barcode Scanner Unresponsive",
                "Aisle 5 (Snacks & Confectionery)",
                "MEDIUM",
                "IN_PROGRESS",
                "Express Checkout Staff",
                "Yesterday, 04:15 PM",
                "Handheld terminal #04 laser trigger failing. Ticket assigned to IT support."
        ));

        // 14. Seed Express Pickup Orders
        StoreProduct sm_spMilk = storeProductRepository.findByStoreIdAndProductId(supermarket.getId(), pMilkAmul.getId()).orElse(null);
        StoreProduct sm_spSalt = storeProductRepository.findByStoreIdAndProductId(supermarket.getId(), pSaltTata.getId()).orElse(null);

        if (sm_spAtta != null && sm_spMilk != null && sm_spSalt != null) {
            Order o1 = new Order();
            o1.setOrderNumber("ORD-8921");
            o1.setCustomerName("Akash Sharma");
            o1.setCustomerPhone("+91 98765 43210");
            o1.setPickupCode("PKP-721");
            o1.setTotalAmount(421.0);
            o1.setStatus("PENDING");
            o1.setCreatedAtFormatted("Today, 10:15 AM");
            o1.getItems().add(new OrderItem(sm_spAtta.getId(), pAttaAashirvaad.getName(), 1, sm_spAtta.getPrice(), "Aisle 1"));
            o1.getItems().add(new OrderItem(sm_spMilk.getId(), pMilkAmul.getName(), 2, sm_spMilk.getPrice(), "Aisle 3"));
            o1.getItems().add(new OrderItem(sm_spSalt.getId(), pSaltTata.getName(), 1, sm_spSalt.getPrice(), "Aisle 1"));
            o1.setStoreId(supermarket.getId());
            o1.setCustomerId(customerUser.getId());
            orderRepository.save(o1);
        }

        // 15. Seed Initial Store Reviews
        // Krishna Mart (Average Rating: 4.8)
        storeReviewRepository.save(new StoreReview(krishnaStore, customerUser, null, "ORD-6001", 5, "Best grocery store in the area! Super clean and everything is available.", "Akash Sharma"));
        storeReviewRepository.save(new StoreReview(krishnaStore, customerUser, null, "ORD-6002", 5, "Excellent customer service and top quality spices and pulses.", "Pooja Mehta"));
        storeReviewRepository.save(new StoreReview(krishnaStore, customerUser, null, "ORD-6003", 5, "Quick checkout and good discounts on daily staples.", "Rohan Deshmukh"));
        storeReviewRepository.save(new StoreReview(krishnaStore, customerUser, null, "ORD-6004", 5, "Fresh dairy items and polite staff always.", "Sneha Verma"));
        storeReviewRepository.save(new StoreReview(krishnaStore, customerUser, null, "ORD-6005", 4, "Wide range of snacks and household items.", "Vikram Singh"));

        // FreshMart Supermarket (Average Rating: 4.6)
        storeReviewRepository.save(new StoreReview(supermarket, customerUser, null, "ORD-8001", 5, "Large variety and well organized aisles. The express pickup token system saved me 20 minutes!", "Akash Sharma"));
        storeReviewRepository.save(new StoreReview(supermarket, customerUser, null, "ORD-8002", 4, "Great deals on household items and FMCG goods. Very clean store.", "Neha Kapoor"));
        storeReviewRepository.save(new StoreReview(supermarket, customerUser, null, "ORD-8003", 5, "The shelf navigation and inventory tracking is spot on. Everything was in stock.", "Amitabh Sen"));
        storeReviewRepository.save(new StoreReview(supermarket, customerUser, null, "ORD-8004", 5, "Easy parking and seamless digital payments.", "Priya Nair"));
        storeReviewRepository.save(new StoreReview(supermarket, customerUser, null, "ORD-8005", 4, "Very convenient for bulk monthly shopping.", "Karan Johar"));

        // Harsh Kirana Store (Average Rating: 4.4)
        storeReviewRepository.save(new StoreReview(harshStore, customerUser, null, "ORD-5001", 5, "Harsh bhai is very friendly and stocks fresh milk every morning.", "Akash Sharma"));
        storeReviewRepository.save(new StoreReview(harshStore, customerUser, null, "ORD-5002", 5, "Great neighborhood store for emergency provisions.", "Sunil Rao"));
        storeReviewRepository.save(new StoreReview(harshStore, customerUser, null, "ORD-5003", 4, "Prices are reasonable and UPI payment is seamless.", "Divya Kulkarni"));
        storeReviewRepository.save(new StoreReview(harshStore, customerUser, null, "ORD-5004", 4, "Good stock of daily biscuits, tea, and atta.", "Manoj Gupta"));
        storeReviewRepository.save(new StoreReview(harshStore, customerUser, null, "ORD-5005", 4, "Always open on time and very dependable.", "Anil Kumar"));

        // Gupta Kirana & Provision Store (Average Rating: 4.2)
        storeReviewRepository.save(new StoreReview(kiranaStore, customerUser, null, "ORD-7001", 5, "Super fresh groceries and very quick counter pickup! Ramesh bhai always keeps items packed neatly.", "Akash Sharma"));
        storeReviewRepository.save(new StoreReview(kiranaStore, customerUser, null, "ORD-7002", 5, "Always reliable for daily milk, atta, and spices. Very polite service.", "Pooja Mehta"));
        storeReviewRepository.save(new StoreReview(kiranaStore, customerUser, null, "ORD-7003", 4, "Good neighborhood store, quality of staples is top notch.", "Rohan Deshmukh"));
        storeReviewRepository.save(new StoreReview(kiranaStore, customerUser, null, "ORD-7004", 4, "Helpful shopkeeper and prompt assistance.", "Meera Joshi"));
        storeReviewRepository.save(new StoreReview(kiranaStore, customerUser, null, "ORD-7005", 3, "Decent selection, occasionally busy during evening hours.", "Suresh Raina"));
    }

    private StoreProduct seedStoreProduct(
            Store store, Product product, Double price, Double mrp,
            Double packageQuantity, ProductUnit unit, Integer stockQuantity,
            Integer lowStockThreshold, String aisleNumber, String rowNumber,
            String shelfNumber, String sectionLabel) {
        StoreProduct sp = new StoreProduct();
        sp.setStore(store);
        sp.setProduct(product);
        sp.setPrice(price);
        sp.setMrp(mrp != null ? mrp : price);
        sp.setPackageQuantity(packageQuantity != null ? packageQuantity : 1.0);
        sp.setUnit(unit != null ? unit : ProductUnit.PACKET);
        sp.setStockQuantity(stockQuantity != null ? stockQuantity : 0);
        sp.setLowStockThreshold(lowStockThreshold != null ? lowStockThreshold : 5);
        sp.setAisleNumber(aisleNumber);
        sp.setRowNumber(rowNumber);
        sp.setShelfNumber(shelfNumber);
        sp.setSectionLabel(sectionLabel);
        return storeProductRepository.save(sp);
    }
}
