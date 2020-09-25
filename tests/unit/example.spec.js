import { shallowMount, mount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper1 = shallowMount(HelloWorld, {
      props: { msg }
    })
    expect(wrapper1.text()).toMatch(msg)
  })
  let wrapper = mount(HelloWorld);
  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('What is the sum of the two numbers?')
  })

  it('button click without correct sum', async () => {
    expect(wrapper.vm.message).toBe("")
    const button = wrapper.find('button')
    button.trigger('click')
    expect(wrapper.vm.message).toBe('TRY AGAIN')
  })
  it('renders correctly with different data', async () => {
    wrapper.vm.x1 = 5;
    wrapper.vm.x2 = 10
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('10')
  })

  it('button click with correct sum', () => {
    wrapper.vm.guess = wrapper.vm.x1 + wrapper.vm.x2;
    const button = wrapper.find('button')
    button.trigger('click')
    expect(wrapper.vm.message).toBe('SUCCESS!')
  })
  
})

