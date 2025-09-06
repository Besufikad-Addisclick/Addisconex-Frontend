# Performance Optimization Guide

This document outlines the performance optimizations implemented to improve navigation speed and overall application performance.

## 🚀 Implemented Optimizations

### 1. **Middleware Caching**
- **Issue**: Subscription checks were being made on every dashboard navigation
- **Solution**: Implemented in-memory caching for subscription status (5-minute TTL)
- **Impact**: Reduces API calls by ~80% for repeated navigation

### 2. **Lazy Loading Components**
- **Components**: `LazyWrapper`, `OptimizedImage`, `PerformanceMonitor`
- **Benefits**: Reduces initial bundle size and improves Time to Interactive (TTI)
- **Usage**: Wrap heavy components with `LazyWrapper`

### 3. **Image Optimization**
- **Features**: WebP/AVIF support, lazy loading, blur placeholders
- **Configuration**: Optimized sizes, quality settings, caching headers
- **Impact**: Faster image loading and reduced bandwidth usage

### 4. **API Client Optimization**
- **Caching**: GET requests cached with configurable TTL
- **Deduplication**: Prevents duplicate simultaneous requests
- **Token Refresh**: Automatic retry with new tokens
- **Impact**: Reduces redundant API calls and improves response times

### 5. **Bundle Optimization**
- **Tree Shaking**: Removes unused code
- **Code Splitting**: Lazy loads components and routes
- **Minification**: SWC minifier for faster builds
- **Impact**: Smaller bundle sizes and faster loading

## 📊 Performance Monitoring

### Built-in Monitoring
```tsx
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';

// Enable in development
<PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
```

### Custom Hooks
```tsx
import { usePerformanceMeasure, useApiPerformance } from '@/components/performance/PerformanceMonitor';

// Measure component render time
const MyComponent = () => {
  usePerformanceMeasure('MyComponent');
  // component logic
};

// Measure API call performance
const { measureApiCall } = useApiPerformance();
const data = await measureApiCall(() => api.get('/endpoint'), '/endpoint');
```

## 🛠 Usage Examples

### Lazy Loading Components
```tsx
import { LazyWrapper, withLazyLoading } from '@/components/performance/LazyWrapper';

// Method 1: Wrap component
<LazyWrapper fallback={<LoadingSpinner />}>
  <HeavyComponent />
</LazyWrapper>

// Method 2: HOC
const LazyHeavyComponent = withLazyLoading(HeavyComponent);
```

### Optimized Images
```tsx
import { OptimizedImage } from '@/components/performance/ImageOptimizer';

<OptimizedImage
  src="/image.jpg"
  alt="AddisConX"
  width={800}
  height={600}
  priority={false}
  placeholder="blur"
  quality={75}
/>
```

### Debounced Search
```tsx
import { useDebounce } from '@/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearchTerm) {
    // Perform search
  }
}, [debouncedSearchTerm]);
```

### Virtualized Lists
```tsx
import { useVirtualization } from '@/hooks/useVirtualization';

const { virtualItems, totalHeight, containerRef } = useVirtualization(items, {
  itemHeight: 60,
  containerHeight: 400,
  overscan: 5
});
```

## ⚡ Performance Best Practices

### 1. **Component Optimization**
- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()` for expensive calculations
- Avoid inline object/function creation in render

### 2. **API Optimization**
- Use the optimized API client for automatic caching
- Implement request deduplication
- Use pagination for large datasets
- Implement optimistic updates where appropriate

### 3. **Bundle Optimization**
- Use dynamic imports for route-based code splitting
- Implement lazy loading for heavy components
- Optimize third-party library imports
- Use tree shaking to remove unused code

### 4. **Image Optimization**
- Use Next.js Image component with optimization
- Implement proper image sizing and formats
- Use blur placeholders for better UX
- Implement lazy loading for below-the-fold images

### 5. **Caching Strategy**
- Implement appropriate cache headers
- Use service workers for offline caching
- Cache API responses with proper TTL
- Implement cache invalidation strategies

## 🔧 Configuration

### Next.js Configuration
The `next.config.js` file includes:
- Image optimization settings
- Bundle analyzer configuration
- Headers for caching
- Compiler optimizations

### Environment Variables
```env
# Performance monitoring
NODE_ENV=development  # Enables performance monitoring
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## 📈 Monitoring and Metrics

### Key Metrics to Track
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Tools for Monitoring
- Chrome DevTools Lighthouse
- Web Vitals extension
- Built-in PerformanceMonitor component
- Custom performance hooks

## 🚨 Common Performance Issues

### 1. **Large Bundle Sizes**
- **Cause**: Importing entire libraries instead of specific functions
- **Solution**: Use tree shaking and dynamic imports

### 2. **Unnecessary Re-renders**
- **Cause**: Missing memoization or inline object creation
- **Solution**: Use React.memo, useMemo, useCallback

### 3. **Blocking API Calls**
- **Cause**: Synchronous API calls in render
- **Solution**: Use async/await with proper loading states

### 4. **Memory Leaks**
- **Cause**: Unsubscribed event listeners or timers
- **Solution**: Proper cleanup in useEffect

## 🔄 Continuous Optimization

### Regular Tasks
1. **Bundle Analysis**: Run bundle analyzer monthly
2. **Performance Audits**: Use Lighthouse for regular checks
3. **Cache Review**: Monitor cache hit rates and adjust TTL
4. **Image Optimization**: Audit and optimize images quarterly

### Performance Budget
- **JavaScript Bundle**: < 250KB gzipped
- **CSS Bundle**: < 50KB gzipped
- **Images**: < 1MB total per page
- **API Response Time**: < 200ms average

## 📚 Additional Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/evaluate-performance/)



