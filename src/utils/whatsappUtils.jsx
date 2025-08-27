// whatsappUtils.js
export const generateWhatsAppMessage = (invoiceData) => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * invoiceData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * invoiceData.tax) / 100;
    const finalTotal = taxableAmount + taxAmount;

    const message = `
🧾 *INVOICE*

*Invoice #:* ${invoiceData.invoiceNumber}
*Date:* ${new Date(invoiceData.date).toLocaleDateString()}
*Due Date:* ${new Date(invoiceData.dueDate).toLocaleDateString()}

*From:* ${invoiceData.vendor.name}
📧 ${invoiceData.vendor.email}
📞 ${invoiceData.vendor.phone}
📍 ${invoiceData.vendor.address}

*To:* ${invoiceData.customer.name}
📧 ${invoiceData.customer.email}
📞 ${invoiceData.customer.phone}
📍 ${invoiceData.customer.address}

*ITEMS:*
${invoiceData.items.map(item =>
        `• ${item.name} - ${item.quantity} × ₹${item.price} = ₹${item.total}`
    ).join('\n')}

*SUMMARY:*
Subtotal: ₹${subtotal.toFixed(2)}
${invoiceData.discount > 0 ? `Discount (${invoiceData.discount}%): -₹${discountAmount.toFixed(2)}` : ''}
Tax (${invoiceData.tax}%): ₹${taxAmount.toFixed(2)}
*Total: ₹${finalTotal.toFixed(2)}*

Thank you for your business! 🙏
    `.trim();

    return encodeURIComponent(message);
};

export const sendWhatsAppMessage = (phoneNumber, message) => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};