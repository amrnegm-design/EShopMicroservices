using System;
using System.Collections.Generic;
using System.Text;

namespace Ordering.Domain.ValueObjects
{
    public record ProductId
    {
        public Guid Value { get; }
    }
}
