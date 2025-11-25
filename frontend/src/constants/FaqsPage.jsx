import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

function FAQsPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      category: "Shopping & Orders",
      faqs: [
        {
          question: "How do I place an order?",
          answer: "Simply browse our collections, add items to your cart, and proceed to checkout. You'll be able to track your order in real-time once it's confirmed."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept M-PESA, credit/debit cards, and bank transfers. All transactions are secure and encrypted."
        },
        {
          question: "Do you offer international shipping?",
          answer: "Currently, we ship within Kenya. We're expanding to other East African countries soon. Check back for updates!"
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "If your order hasn't been processed yet, you can cancel it within 2 hours of placing it. Contact our support team for assistance."
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 2-3 business days in Nairobi and 4-5 business days for other areas. Express delivery is available for urgent orders."
        }
      ]
    },
    {
      category: "Products & Sizing",
      faqs: [
        {
          question: "How do I know what size to order?",
          answer: "Each product page has a detailed size guide with measurements. We recommend checking these before ordering to ensure the perfect fit."
        },
        {
          question: "Are all products original?",
          answer: "Yes! All our products are 100% authentic and sourced from authorized distributors. We guarantee quality on every item."
        },
        {
          question: "Do you restock sold-out items?",
          answer: "Most items are restocked regularly. You can sign up for restock notifications on product pages to be alerted when items are available again."
        },
        {
          question: "What is your sizing policy?",
          answer: "We follow international sizing standards. Our size guides are detailed and accurate. If you're between sizes, we recommend sizing up for comfort."
        },
        {
          question: "Can I see product reviews before buying?",
          answer: "Yes! Each product page displays verified customer reviews and ratings. Read these to make informed decisions."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      faqs: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy on all items in original condition with tags attached. Refunds are processed within 5-7 business days."
        },
        {
          question: "How do I initiate a return?",
          answer: "Go to your Orders page, select the item you want to return, and follow the return process. We'll provide a prepaid return label."
        },
        {
          question: "Are there any non-returnable items?",
          answer: "Intimate items, swimwear, and items without tags cannot be returned for hygiene reasons. All other items are returnable within 30 days."
        },
        {
          question: "How long does a refund take?",
          answer: "Once we receive and inspect your return, refunds are processed within 5-7 business days. You'll receive a notification once it's complete."
        },
        {
          question: "What if the item is defective?",
          answer: "If you receive a defective item, contact us immediately with photos. We'll replace it or issue a full refund at no cost to you."
        }
      ]
    },
    {
      category: "Account & Security",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' in the top right corner, enter your email and password, and you're ready to go. You can also sign in with social media."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes! We use industry-standard SSL encryption and comply with data protection regulations. Your privacy is our priority."
        },
        {
          question: "Can I change my password?",
          answer: "Yes, go to Account Settings and click 'Change Password'. You'll need to verify your email before confirming the change."
        },
        {
          question: "How do I track my order?",
          answer: "Once your order is shipped, you'll receive a tracking link via email. You can also track it from your Orders page in your account."
        },
        {
          question: "What if I forget my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions to reset it."
        }
      ]
    },
    {
      category: "General",
      faqs: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach us via email at support@ecom.com, call +254 700 000 000, or use our live chat (9 AM - 6 PM EAT)."
        },
        {
          question: "Do you have a loyalty program?",
          answer: "We reward our repeat customers with exclusive discounts and early access to new collections. Join our newsletter for updates!"
        },
        {
          question: "Can I gift my order?",
          answer: "Yes! You can add a gift message during checkout, and we'll include it in the package at no extra cost."
        },
        {
          question: "How often do you have sales?",
          answer: "We run seasonal sales and flash deals regularly. Subscribe to our newsletter to stay updated on upcoming promotions."
        },
        {
          question: "Do you offer bulk/wholesale orders?",
          answer: "Yes! For corporate orders and bulk purchases, email us at wholesale@ecom.com and we'll provide special pricing."
        }
      ]
    }
  ];

  const filteredFaqs = faqCategories.map((cat) => ({
    ...cat,
    faqs: cat.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter((cat) => cat.faqs.length > 0);

  const FAQItem = ({ question, answer, index, categoryIndex }) => {
    const uniqueIndex = `${categoryIndex}-${index}`;
    const isOpen = openIndex === uniqueIndex;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition">
        <button
          onClick={() => setOpenIndex(isOpen ? null : uniqueIndex)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
        >
          <h4 className="font-semibold text-gray-900 text-left">{question}</h4>
          <ChevronDown
            size={20}
            className={`text-gray-600 flex-shrink-0 transition transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">{answer}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions about shopping, orders, returns, and more.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-600">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <FAQItem
                      key={faqIndex}
                      question={faq.question}
                      answer={faq.answer}
                      index={faqIndex}
                      categoryIndex={catIndex}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">No results found for "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Contact Us
            </a>
            <a
              href="mailto:support@ecom.com"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQsPage;