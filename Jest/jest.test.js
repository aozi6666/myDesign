test('test common matcher', () => {
    expect(2 + 2).toBe(4);
    expect(2 + 2).not.toBe(5);
})

test('test toBe true or false', () => {
    expect(1).toBeTruthy();
    expect(0).toBeFalsy();
})

test('test number', () => { 
    expect(2 + 2).toBeGreaterThan(3);
    expect(2 + 2).toBeLessThanOrEqual(5);
})

test('test Object', () => {
    expect({name: 'Jest'}).toEqual({name: 'Jest'});  // toEqual: 测试值相同
    // false: 原因 toBe测试完全相同（内存地址相同）
    // expect({name: 'Jest'}).toBe({name: 'Jest'});   
    
    const obj = { name: 'Jest' };
    expect(obj).toEqual({ name: 'Jest' });
    expect(obj).toBe(obj);
})