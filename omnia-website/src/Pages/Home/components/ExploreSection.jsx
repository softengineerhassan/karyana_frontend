import * as Icons from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLocalizedField } from '@/lib/localization';

export default function ExploreSection({ categories, onCategoryClick }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  // Create icon map for dynamic icon rendering
  const iconMap = categories.reduce((acc, cat) => {
    acc[cat.icon] = Icons[cat.icon] || Icons.Sparkles;
    return acc;
  }, {});

  return (
    <div className="px-6 mb-12">
      <div className="mb-10 text-center">
        <h4 
          className="text-[#1A1A1C] mb-2 text-2xl" 
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
        >
          {t('home.explore.title', 'Explore')}
        </h4>
        <p className="text-[#8B8680] text-xs uppercase tracking-[0.25em]">
          {t('home.explore.subtitle', 'Five Worlds of Excellence')}
        </p>
      </div>
      
      {/* Premium Badge Grid */}
      <div className="flex flex-col items-center gap-4">
        {/* First Row - 3 Categories */}
        <div className="flex justify-center gap-4 w-full max-w-sm">
          {categories.slice(0, 3).map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <div
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="relative cursor-pointer group flex-1 max-w-[100px]"
              >
                {/* Badge Container - Perfect Square */}
                <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                  {/* Subtle outer glow on hover only */}
                  <div 
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"
                    style={{
                      background: `radial-gradient(circle, ${category.color}20 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Main badge square */}
                  <div className="absolute inset-0 bg-white rounded-2xl border border-[#E8E3D5] group-hover:border-[#D4AF37] transition-all duration-700 shadow-md group-hover:shadow-xl overflow-hidden">
                    {/* Very subtle radial gradient background */}
                    <div 
                      className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700"
                      style={{
                        background: `radial-gradient(circle at 50% 30%, ${category.color}25 0%, transparent 65%)`
                      }}
                    />
                    
                    {/* Refined corner accents */}
                    <div 
                      className="absolute top-0 left-0 w-4 h-4 border-t border-l opacity-15 group-hover:opacity-25 transition-all duration-700 rounded-tl-2xl" 
                      style={{ borderColor: category.color }} 
                    />
                    <div 
                      className="absolute bottom-0 right-0 w-4 h-4 border-b border-r opacity-15 group-hover:opacity-25 transition-all duration-700 rounded-br-2xl" 
                      style={{ borderColor: category.color }} 
                    />
                    
                    {/* Content container */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      {/* Icon container - minimal decoration */}
                      <div className="relative mb-3">
                        {/* Single refined ring */}
                        <div 
                          className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-20 transition-all duration-700"
                          style={{
                            border: `1px solid ${category.color}`
                          }}
                        />
                        
                        {/* Icon background */}
                        <div
                          className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-700 group-hover:scale-105"
                          style={{ 
                            backgroundColor: `${category.color}08`,
                            border: `1px solid ${category.color}18`,
                            boxShadow: `0 2px 8px ${category.color}08`
                          }}
                        >
                          <Icon 
                            className="w-5 h-5 transition-all duration-700" 
                            style={{ 
                              color: category.color, 
                              strokeWidth: 1.5
                            }} 
                          />
                        </div>
                      </div>
                      
                      {/* Category name */}
                      <div className="text-center w-full">
                        <p className="text-[#1A1A1C] text-[9px] leading-tight font-bold tracking-wider uppercase line-clamp-2 transition-colors duration-700 group-hover:text-[#5C5850]">
                          {getLocalizedField(category, 'name', language)}
                        </p>
                      </div>
                      
                      {/* Minimal accent dot */}
                      <div 
                        className="absolute bottom-3 w-1 h-1 rounded-full opacity-25 group-hover:opacity-40 transition-all duration-700"
                        style={{ backgroundColor: category.color }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Second Row - 2 Categories (Centered) */}
        <div className="flex justify-center gap-4 w-full max-w-[216px]">
          {categories.slice(3, 5).map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <div
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="relative cursor-pointer group flex-1 max-w-[100px]"
              >
                {/* Badge Container - Perfect Square */}
                <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                  {/* Subtle outer glow on hover only */}
                  <div 
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"
                    style={{
                      background: `radial-gradient(circle, ${category.color}20 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Main badge square */}
                  <div className="absolute inset-0 bg-white rounded-2xl border border-[#E8E3D5] group-hover:border-[#D4AF37] transition-all duration-700 shadow-md group-hover:shadow-xl overflow-hidden">
                    {/* Very subtle radial gradient background */}
                    <div 
                      className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700"
                      style={{
                        background: `radial-gradient(circle at 50% 30%, ${category.color}25 0%, transparent 65%)`
                      }}
                    />
                    
                    {/* Refined corner accents */}
                    <div 
                      className="absolute top-0 left-0 w-4 h-4 border-t border-l opacity-15 group-hover:opacity-25 transition-all duration-700 rounded-tl-2xl" 
                      style={{ borderColor: category.color }} 
                    />
                    <div 
                      className="absolute bottom-0 right-0 w-4 h-4 border-b border-r opacity-15 group-hover:opacity-25 transition-all duration-700 rounded-br-2xl" 
                      style={{ borderColor: category.color }} 
                    />
                    
                    {/* Content container */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      {/* Icon container - minimal decoration */}
                      <div className="relative mb-3">
                        {/* Single refined ring */}
                        <div 
                          className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-20 transition-all duration-700"
                          style={{
                            border: `1px solid ${category.color}`
                          }}
                        />
                        
                        {/* Icon background */}
                        <div
                          className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-700 group-hover:scale-105"
                          style={{ 
                            backgroundColor: `${category.color}08`,
                            border: `1px solid ${category.color}18`,
                            boxShadow: `0 2px 8px ${category.color}08`
                          }}
                        >
                          <Icon 
                            className="w-5 h-5 transition-all duration-700" 
                            style={{ 
                              color: category.color, 
                              strokeWidth: 1.5
                            }} 
                          />
                        </div>
                      </div>
                      
                      {/* Category name */}
                      <div className="text-center w-full">
                        <p className="text-[#1A1A1C] text-[9px] leading-tight font-bold tracking-wider uppercase line-clamp-2 transition-colors duration-700 group-hover:text-[#5C5850]">
                          {getLocalizedField(category, 'name', language)}
                        </p>
                      </div>
                      
                      {/* Minimal accent dot */}
                      <div 
                        className="absolute bottom-3 w-1 h-1 rounded-full opacity-25 group-hover:opacity-40 transition-all duration-700"
                        style={{ backgroundColor: category.color }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
