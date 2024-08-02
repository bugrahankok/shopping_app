package com.bugrashopping.shoppingapp.service;

import com.bugrashopping.shoppingapp.model.Product;

import java.util.List;

public interface ProductService {
    Product saveProduct(Product product);
    List<Product> getAllProducts();
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);
}
